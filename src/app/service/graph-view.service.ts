import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {PixiService} from "./pixi.service";
import {GraphModelService} from "./graph-model.service";
import {NodeView, SELECTED_NODE_STYLE} from "../model/graphical-model/node-view";
import {NodeViewFabricService} from "./node-view-fabric.service";
import {StateService} from "./state.service";
import {GraphElement} from "../model/graphical-model/graph-element";
import {EdgeView, SELECTED_EDGE_STYLE} from "../model/graphical-model/edge-view";
import {EdgeViewFabricService} from "./edge-view-fabric.service";
import {Point} from "../utils/graphical-utils";

/**
 * Service for handling the graphical representation of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphViewService extends GraphModelService {

  // TODO Create separate class for storing graph elements
  private _nodeViews: Map<number, NodeView> = new Map<number, NodeView>(); // key is the node index

  private _edgeViews: Map<string, EdgeView> = new Map<string, EdgeView>(); // key is the edge index

  private _currentGraph: Graph | undefined;

  private _selectedElements: GraphElement[] = [];

  constructor(private pixiService: PixiService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private stateService: StateService) {
    super();
  }

  /**
   * Adds a node to the graph and the graph view.
   * All other methods for adding nodes should call this method.
   */
  public addNodeToGraphView(graph: Graph, nodeView: NodeView) {
    super.addNodeToGraph(graph, nodeView.node);
    this._nodeViews.set(nodeView.node.index, nodeView);
    this.pixiService.getApp().stage.addChild(nodeView); // TODO Add container, not the node itself
    this.stateService.addedNode(nodeView); // Notify state service
    console.log("Added node to graph: " + nodeView.node.index); // TODO remove
  }

  /**
   * Removes a node from the graph and the graph view.
   * All other methods for removing nodes should call this method.
   */
  public removeNodeFromGraphView(graph: Graph, nodeView: NodeView) {
    if (this._selectedElements.includes(nodeView)) { // remove from selected elements
      this.unselectElement(nodeView);
    }
    // Remove adjacent edges
    this.removeAdjacentEdges(graph, nodeView);
    this._nodeViews.delete(nodeView.node.index);
    this.pixiService.getApp().stage.removeChild(nodeView);
    super.removeNodeFromGraph(graph, nodeView.node); // Should be called after removing from view
    this.stateService.deletedNode(nodeView); // Notify state service
    console.log("Removed node from graph: " + nodeView.node.index); // TODO remove
  }

  /**
   * Adds an edge to the graph and the graph view.
   * All other methods for adding edges should call this method.
   */
  public addEdgeToGraphView(graph: Graph, edgeView: EdgeView) {
    super.addEdgeToGraph(graph, edgeView.edge);
    this._edgeViews.set(edgeView.edge.edgeIndex.value, edgeView);
    this.pixiService.getApp().stage.addChild(edgeView); // TODO Add container, not the edge itself
    this.stateService.addedEdge(edgeView); // Notify state service
    console.log("Added edge to graph: " + edgeView.edge.edgeIndex.value); // TODO remove
  }

  /**
   * Removes an edge from the graph and the graph view.
   * All other methods for removing edges should call this method.
   */
  public removeEdgeFromGraphView(graph: Graph, edgeView: EdgeView) {
    if (this.isElementSelected(edgeView)) { // remove from selected elements
      this.unselectElement(edgeView);
    }
    this._edgeViews.delete(edgeView.edge.edgeIndex.value);
    this.pixiService.getApp().stage.removeChild(edgeView);
    super.removeEdgeFromGraph(graph, edgeView.edge); // Should be called after removing from view
    this.stateService.deletedEdge(edgeView); // Notify state service
    console.log("Removed edge from graph: " + edgeView.edge.edgeIndex.value); // TODO remove
  }

  public moveNodeView(nodeView: NodeView, point: Point) {
    nodeView.coordinates = point; // Move node (called move() inside setter)
    // Move adjacent edges
    let adjacentEdges: EdgeView[] = this.getAdjacentEdgeViews(this.currentGraph, nodeView);
    adjacentEdges.forEach((edgeView: EdgeView) => {
      edgeView.move(); // Move edge
    });
  }

  public getAdjacentEdgeViews(graph: Graph, nodeView: NodeView): EdgeView[] {
    let edges: EdgeView[] = [];
    nodeView.node.getAdjacentEdges().forEach((edgeIndex: string) => {
      const edgeView = this._edgeViews.get(edgeIndex);
      if (edgeView) {
        edges.push(edgeView);
      }
    })
    return edges;
  }

  /**
   * Adds a node to the current graph view with the given coordinates.
   */
  public addNodeToCurrentGraphView(x: number, y: number) {
    if (this.currentGraph) {
      let nodeView: NodeView = this.nodeFabric.createDefaultNodeViewWithCoordinates(this.currentGraph,
        {x: x, y: y});
      this.addNodeToGraphView(this.currentGraph, nodeView);
    } else {
      console.error("No current graph set"); // TODO throw exception
    }
  }

  public removeNodeFromCurrentGraphView(nodeView: NodeView) {
    if (this.currentGraph) {
      this.removeNodeFromGraphView(this.currentGraph, nodeView);
    } else {
      console.error("No current graph set"); // TODO throw exception
    }
  }

  public isElementSelected(element: GraphElement): boolean {
    return this._selectedElements.includes(element);
  }

  public selectElement(element: GraphElement) {
    if (!this.isElementSelected(element)) {
      this._selectedElements.push(element);
    } else {
      return; // Element already selected
    }
    if (element instanceof NodeView) {
      this.nodeFabric.changeToStyle(element, SELECTED_NODE_STYLE);
    } else if (element instanceof EdgeView) {
      this.edgeFabric.changeToStyle(element, SELECTED_EDGE_STYLE);
    }
  }

  public unselectElement(element: GraphElement) {
    const index = this._selectedElements.indexOf(element);
    if (index !== -1) {
      this._selectedElements.splice(index, 1);
    } else {
      console.error("Element not found in selected elements"); // TODO throw exception
      return;
    }
    if (element instanceof NodeView) {
      this.nodeFabric.changeToPreviousStyle(element);
    } else if (element instanceof EdgeView) {
      this.edgeFabric.changeToPreviousStyle(element);
    }
  }

  public clearSelection() {
    this._selectedElements.forEach((element: GraphElement) => {
      if (element instanceof NodeView) {
        this.nodeFabric.changeToPreviousStyle(element);
      } else if (element instanceof EdgeView) {
        this.edgeFabric.changeToPreviousStyle(element);
      }
    });
    this._selectedElements = [];
  }

  public isSelectionEmpty(): boolean {
    return this._selectedElements.length === 0;
  }

  private removeAdjacentEdges(graph: Graph, nodeView: NodeView) {
    let adjacentEdges: EdgeView[] = this.getAdjacentEdgeViews(graph, nodeView);
    adjacentEdges.forEach((edgeView: EdgeView) => {
      this.removeEdgeFromGraphView(graph, edgeView);
    });
  }

  get selectedElements(): GraphElement[] {
    return this._selectedElements;
  }

  get nodeViews(): Map<number, NodeView> {
    return this._nodeViews;
  }

  get edgeViews(): Map<string, EdgeView> {
    return this._edgeViews;
  }

  get currentGraph(): Graph {
    return <Graph>this._currentGraph;
  }

  set currentGraph(value: Graph) {
    this._currentGraph = value;
  }
}
