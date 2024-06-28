import {Injectable} from '@angular/core';
import {Graph} from "../../model/graph";
import {PixiService} from "../pixi.service";
import {GraphModelService} from "./graph-model.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {NodeViewFabricService} from "../fabric/node-view-fabric.service";
import {StateService} from "../event/state.service";
import {GraphElement} from "../../model/graphical-model/graph-element";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {EdgeViewFabricService} from "../fabric/edge-view-fabric.service";
import {Point} from "../../utils/graphical-utils";
import {EdgeOrientation, GraphOrientation} from "../../model/orientation";
import {
  DEFAULT_HELPER_ITEM,
  EDIT_EDGE_WEIGHT_MODE_HELPER_ITEM
} from "../../component/canvas/float-helper/float-helper.component";
import {DefaultGraphViewGenerator} from "../../logic/graph-view-generator/default-graph-view-generator";
import {ConfService} from "../config/conf.service";

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
  public addNodeToGraphView(graph: Graph, nodeView: NodeView, callModel: boolean = true) {
    if (callModel) {
      super.addNodeToGraph(graph, nodeView.node);
    }
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
  public addEdgeToGraphView(graph: Graph, edgeView: EdgeView, callModel: boolean = true) {
    if (edgeView.edge.isLoop()) {
      console.error("Loop edge is not supported for now"); // TODO implement loop edge
      return;
    }
    if (callModel) {
      super.addEdgeToGraph(graph, edgeView.edge);
    }
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
  public populateGraphView(graph: Graph, nodeViews: NodeView[], edgeViews: EdgeView[], callModel: boolean = true) {
    nodeViews.forEach((nodeView: NodeView) => {
      this.addNodeToGraphView(graph, nodeView, callModel);
    });
    edgeViews.forEach((edgeView: EdgeView) => {
      this.addEdgeToGraphView(graph, edgeView, callModel);
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

  /**
   * Changes the weight of the given edge view.
   */
  public changeEdgeViewWeight(edgeView: EdgeView, weight: number) {
    edgeView.changeEdgeWeight(weight);
    this.edgeFabric.updateEdgeViewWeightTexture(edgeView); // Update texture, to resize text box
    console.log('Edge weight changed: edge: ' + edgeView.getIndex() + '; weight: ' + weight); // TODO remove
    this.stateService.edgeWeightChanged(edgeView);
  }

  /**
   * Changes the graph orientation.
   */
  public changeGraphOrientation(graph: Graph, orientation: GraphOrientation) {
    graph.orientation = orientation;
    console.log("Graph orientation changed: " + orientation); // TODO remove
    if (orientation === GraphOrientation.MIXED) { // If mixed, do not change edge orientations
      this.stateService.graphOrientationChanged(orientation);
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
    ConfService.SHOW_WEIGHT = visible;
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

  // ------------------ Graph view creation ------------------
  /**
   * Generate graph view from graph model.
   * Deletes old graph view and creates new one.
   */
  public generateGraphView(newGraph: Graph): void {
    // Clear old graph view elements from canvas and memory
    this.clearAllElementsView(this.currentGraph);
    // Replace current graph with new one
    this.currentGraph = newGraph;
    // Create new graph view elements by default generator
    const generator = new DefaultGraphViewGenerator(this.pixiService, this.nodeFabric,
      this.edgeFabric);
    const result = generator.generateGraphViewElements(newGraph);
    const nodeViews = result.nodes;
    const edgeViews = result.edges;
    // Populate graph view with new elements
    this.populateGraphView(newGraph, nodeViews, edgeViews, false); // Do not call model service methods, because it is already called
    console.log("Graph orientation: " + newGraph.orientation);
    this.changeGraphOrientation(newGraph, newGraph.orientation); // Change orientation (to update state on UI)
    this.stateService.graphViewGenerated(); // Notify state service about graph view generation
  }

  // ------------------ Selection methods ------------------
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
      this.nodeFabric.changeToStyle(element, ConfService.SELECTED_NODE_STYLE);
    } else if (element instanceof EdgeView) {
      this.edgeFabric.changeToStyle(element, ConfService.SELECTED_EDGE_STYLE);
      this.stateService.changeFloatHelperItem(EDIT_EDGE_WEIGHT_MODE_HELPER_ITEM); // Change float helper item
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
      // TODO Create helperService to manage helper items
      this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM); // Change float helper item
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
    this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM); // Change float helper item
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
