import {Injectable} from '@angular/core';
import {Graph} from "../model/graph";
import {PixiService} from "./pixi.service";
import {GraphModelService} from "./graph-model.service";
import {NodeView, SELECTED_NODE_STYLE} from "../model/graphical-model/node/node-view";
import {NodeViewFabricService} from "./node-view-fabric.service";
import {StateService} from "./state.service";
import {GraphElement} from "../model/graphical-model/graph-element";
import {EdgeView, SELECTED_EDGE_STYLE} from "../model/graphical-model/edge/edge-view";
import {EdgeViewFabricService} from "./edge-view-fabric.service";
import {Point} from "../utils/graphical-utils";
import {EdgeOrientation, GraphOrientation} from "../model/orientation";

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

  // TODO Add support for multiple graphs
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
    this.pixiService.mainContainer.addChild(nodeView); // TODO Add container, not the node itself
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
    this.pixiService.mainContainer.removeChild(nodeView);
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
    this.pixiService.mainContainer.addChild(edgeView); // TODO Add container, not the edge itself
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
    this.pixiService.mainContainer.removeChild(edgeView);
    super.removeEdgeFromGraph(graph, edgeView.edge); // Should be called after removing from view
    this.stateService.deletedEdge(edgeView); // Notify state service
    console.log("Removed edge from graph: " + edgeView.edge.edgeIndex.value); // TODO remove
  }

  /**
   * Clears all elements from the graph view.
   * All other methods for clearing elements should call this method.
   */
  public clearAllElementsView(graph: Graph) {
    this.clearSelection();
    this._edgeViews.forEach((edgeView: EdgeView) => {
      this.pixiService.mainContainer.removeChild(edgeView);
    });
    this._nodeViews.forEach((nodeView: NodeView) => {
      this.pixiService.mainContainer.removeChild(nodeView);
    });
    this._nodeViews.clear();
    this._edgeViews.clear();
    super.clearAllElements(graph);
    console.log("Cleared all elements from graph view"); // TODO remove
  }

  /**
   * Populates the graph view of the given graph with node views and edge views.
   */
  public populateGraphView(graph: Graph, nodeViews: NodeView[], edgeViews: EdgeView[]) {
    nodeViews.forEach((nodeView: NodeView) => {
      this.addNodeToGraphView(graph, nodeView);
    });
    edgeViews.forEach((edgeView: EdgeView) => {
      this.addEdgeToGraphView(graph, edgeView);
    });
  }


  /**
   * Moves the given node view to the given point.
   */
  public moveNodeView(nodeView: NodeView, point: Point) {
    nodeView.coordinates = point; // Move node (called move() inside setter)
    // Move adjacent edges
    let adjacentEdges: EdgeView[] = this.getAdjacentEdgeViews(this.currentGraph, nodeView);
    adjacentEdges.forEach((edgeView: EdgeView) => {
      edgeView.move(); // Move edge
    });
  }

  public changeEdgeViewWeight(edgeView: EdgeView, weight: number) {
    // TODO implement
  }

  /**
   * Changes the graph orientation.
   */
  public changeGraphOrientation(graph: Graph, orientation: GraphOrientation) {
    if (orientation === graph.orientation) {
      return;
    }
    graph.orientation = orientation;
    console.log("Graph orientation changed: " + orientation); // TODO remove
    if (orientation === GraphOrientation.MIXED) { // If mixed, do not change edge orientations
      return;
    }
    const edgeOrientation = orientation === GraphOrientation.ORIENTED ? EdgeOrientation.ORIENTED
      : EdgeOrientation.NON_ORIENTED;
    this.edgeViews.forEach((edgeView: EdgeView) => {
      edgeView.changeEdgeOrientation(edgeOrientation);
    });
    this.stateService.graphOrientationChanged(orientation);
  }

  public changeEdgeViewOrientation(edgeView: EdgeView, orientation: EdgeOrientation) {
    // TODO implement
    // TODO implement restriction to non-oriented graph. If graph is non-oriented, do not allow changing edge orientation
  }

  /**
   * Changes the visibility of the edge weights. Changes the visibility of all edge weights and default value
   * for new edges.
   */
  public changeEdgeWeightsVisibility(visible: boolean) {
    EdgeView.SHOW_WEIGHT = visible;
    this.edgeViews.forEach((edgeView: EdgeView) => {
      if (edgeView.weightVisible !== visible) {
        edgeView.changeWeightVisible(visible);
      }
    });
  }

  /**
   * Returns the edge views adjacent to the given node view.
   */
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
   * Return whether the given element is selected.
   */
  public isElementSelected(element: GraphElement): boolean {
    return this._selectedElements.includes(element);
  }

  /**
   * Selects the given element.
   */
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

  /**
   * Unselects the given element.
   */
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

  /**
   * Clears the selection of all elements.
   */
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

  /**
   * Returns whether the selection is empty.
   */
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
