import {Injectable} from '@angular/core';
import {Graph, GraphType} from "../../model/graph";
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
import {GraphView} from "../../model/graphical-model/graph/graph-view";
import {DynamicRadius} from "../../model/graphical-model/node/radius";
import {GraphViewGenerator} from "../../logic/graph-view-generator/graph-view-generator";
import {TreeGraphViewGenerator} from "../../logic/graph-view-generator/tree-graph-view-generator";

/**
 * Service for handling the graphical representation of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphViewService extends GraphModelService {

  // TODO Add support for multiple graphs
  private _currentGraphView: GraphView | undefined;

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
  public addNodeToGraphView(graphView: GraphView, nodeView: NodeView, callModel: boolean = true) {
    if (callModel) {
      super.addNodeToGraph(graphView.graph, nodeView.node);
    }
    this.nodeViews.set(nodeView.node.index, nodeView);
    this.pixiService.mainContainer.addChild(nodeView); // TODO Add container, not the node itself
    this.stateService.addedNode(nodeView); // Notify state service
    //console.log("Added node to graph: " + nodeView.node.index); // TODO remove
  }

  /**
   * Removes a node from the graph and the graph view.
   * All other methods for removing nodes should call this method.
   */
  public removeNodeFromGraphView(graphView: GraphView, nodeView: NodeView) {
    if (this._selectedElements.includes(nodeView)) { // remove from selected elements
      this.unselectElement(nodeView);
    }
    // Remove adjacent edges
    this.removeAdjacentEdges(graphView, nodeView);
    this.nodeViews.delete(nodeView.node.index);
    this.pixiService.mainContainer.removeChild(nodeView);
    super.removeNodeFromGraph(graphView.graph, nodeView.node); // Should be called after removing from view
    this.stateService.deletedNode(nodeView); // Notify state service
    console.log("Removed node from graph: " + nodeView.node.index); // TODO remove
  }

  /**
   * Adds an edge to the graph and the graph view.
   * All other methods for adding edges should call this method.
   */
  public addEdgeToGraphView(graphView: GraphView, edgeView: EdgeView, callModel: boolean = true) {
    if (callModel) {
      super.addEdgeToGraph(graphView.graph, edgeView.edge);
    }
    this.edgeViews.set(edgeView.edge.edgeIndex.value, edgeView);
    this.pixiService.mainContainer.addChild(edgeView); // TODO Add container, not the edge itself
    if (ConfService.DYNAMIC_NODE_SIZE) {
      // Resize nodes
      this.updateRadiusNodes(edgeView.startNode);
      this.updateRadiusNodes(edgeView.endNode);
    }
    this.stateService.addedEdge(edgeView); // Notify state service
    //console.log("Added edge to graph: " + edgeView.edge.edgeIndex.value); // TODO remove
  }

  /**
   * Removes an edge from the graph and the graph view.
   * All other methods for removing edges should call this method.
   */
  public removeEdgeFromGraphView(graphView: GraphView, edgeView: EdgeView) {
    if (this.isElementSelected(edgeView)) { // remove from selected elements
      this.unselectElement(edgeView);
    }
    this.edgeViews.delete(edgeView.edge.edgeIndex.value);
    this.pixiService.mainContainer.removeChild(edgeView);
    super.removeEdgeFromGraph(graphView.graph, edgeView.edge); // Should be called after removing from view
    if (ConfService.DYNAMIC_NODE_SIZE) {
      // Resize nodes
      this.updateRadiusNodes(edgeView.startNode);
      this.updateRadiusNodes(edgeView.endNode);
    }
    this.stateService.deletedEdge(edgeView); // Notify state service
    console.log("Removed edge from graph: " + edgeView.edge.edgeIndex.value); // TODO remove
  }

  /**
   * Clears all elements from the graph view.
   * All other methods for clearing elements should call this method.
   */
  public clearAllElementsView(graphView: GraphView) {
    this.clearSelection();
    this.edgeViews.forEach((edgeView: EdgeView) => {
      this.pixiService.mainContainer.removeChild(edgeView);
    });
    this.nodeViews.forEach((nodeView: NodeView) => {
      nodeView.node.clearEdges();
      this.pixiService.mainContainer.removeChild(nodeView);
    });
    this.nodeViews.clear();
    this.edgeViews.clear();
    super.clearAllElements(graphView.graph);
    console.log("Cleared all elements from graph view"); // TODO remove
  }

  /**
   * Removes the given graph elements from the graph view.
   */
  public removeGraphElements(graphView: GraphView, graphElements: GraphElement[]) {
    // First remove edges, then nodes
    graphElements.filter((element: GraphElement) => element instanceof EdgeView)
      .forEach((element: GraphElement) => {
        this.removeEdgeFromGraphView(graphView, element as EdgeView); // Call base remove method
      });
    graphElements.filter((element: GraphElement) => element instanceof NodeView)
      .forEach((element: GraphElement) => {
        this.removeNodeFromGraphView(graphView, element as NodeView); // Call base remove method
      });
  }

  /**
   * Adds the given graph elements to the graph view.
   */
  public addGraphElements(graphView: GraphView, graphElements: GraphElement[]) {
    // First add nodes, then edges
    graphElements.filter((element: GraphElement) => element instanceof NodeView)
      .forEach((element: GraphElement) => {
        this.addNodeToGraphView(graphView, element as NodeView); // Call base add method
      });
    graphElements.filter((element: GraphElement) => element instanceof EdgeView)
      .forEach((element: GraphElement) => {
        this.addEdgeToGraphView(graphView, element as EdgeView); // Call base add method
      });
  }

  /**
   * Populates the graph view of the given graph with node views and edge views.
   */
  public populateGraphView(graphView: GraphView, nodeViews: NodeView[], edgeViews: EdgeView[], callModel: boolean = true) {
    nodeViews.forEach((nodeView: NodeView) => {
      this.addNodeToGraphView(graphView, nodeView, callModel);
    });
    edgeViews.forEach((edgeView: EdgeView) => {
      this.addEdgeToGraphView(graphView, edgeView, callModel);
    });
  }

  /**
   * Moves the given node view to the given point and updates adjacent edges positions.
   */
  public moveNodeView(nodeView: NodeView, point: Point) {
    nodeView.coordinates = point; // Move node (called move() inside setter)
    // Move adjacent edges
    let adjacentEdges: EdgeView[] = this.getAdjacentEdgeViews(this.currentGraphView, nodeView);
    adjacentEdges.forEach((edgeView: EdgeView) => {
      edgeView.move(); // Move edge
    });
  }

  /**
   * Changes the graph orientation.
   */
  public changeGraphOrientation(graphView: GraphView, orientation: GraphOrientation) {
    graphView.graph.orientation = orientation; // TODO call model service method
    ConfService.DEFAULT_GRAPH_ORIENTATION = orientation; // Update default orientation
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

  /**
   * Returns the edge views adjacent to the given node view.
   */
  public getAdjacentEdgeViews(graphView: GraphView, nodeView: NodeView): EdgeView[] {
    let edges: EdgeView[] = [];
    nodeView.node.getAdjacentEdges().forEach((edgeIndex: string) => {
      const edgeView = this.edgeViews.get(edgeIndex);
      if (edgeView) {
        edges.push(edgeView);
      }
    })
    return edges;
  }

  /**
   * Updates the radius of the nodes connected by the given edge.
   * Should be called when node radius is changed. Or on each remove/add edge when dynamic node size is enabled.
   */
  public updateRadiusNodes(node: NodeView) {
    if (node.nodeStyle.radius instanceof DynamicRadius) {
      node.nodeStyle.radius.adjEdges = node.node.getAdjacentEdges().length;
    }
    this.nodeFabric.updateTexture(node);
    // Adjust position of edges
    let nodeAdjacentEdges = this.getAdjacentEdgeViews(this.currentGraphView, node);
    nodeAdjacentEdges.forEach((edgeView: EdgeView) => {
      edgeView.move();
    });
  }

  // ------------------ Graph view creation ------------------
  /**
   * Create empty graph view.
   * Should be called as soon PixiCanvas is started
   */
  public initializeGraphView(): void {
    const graph = new Graph();
    this.currentGraphView = new GraphView(graph);
  }

  /**
   * Creates graphView from deserialized and configured graphView.
   */
  public importFromGraphView(graph: GraphView) {
    this.initializeGraphView(); // Replace current graph view with new one
    const newEdgeViews = [...graph.edgeViews.entries()];
    // Import nodes
    graph.nodeViews.forEach((nodeView) => {
      // Create new node view from imported node view
      let newNodeView: NodeView = this.nodeFabric.createFromImportedNodeView(nodeView);
      // Add node view to graph view
      this.addNodeToGraphView(this.currentGraphView, newNodeView);
      // Update adjacent edges references
      newEdgeViews.filter((entry) => entry[1].startNode.node.index === nodeView.node.index)
        .forEach((entry) => entry[1].startNode = newNodeView);
      newEdgeViews.filter((entry) => entry[1].endNode.node.index === nodeView.node.index)
        .forEach((entry) => entry[1].endNode = newNodeView);
    });
    // Import edges
    newEdgeViews.forEach((edgeView) => {
      let hasReverseEdge = false; // Flag is needed to generate proper edge view if two nodes have two edges between them
      if (graph.edgeViews.has(edgeView[1].edge.edgeIndex.reverse())
        && graph.graph.orientation === GraphOrientation.ORIENTED) { // has reverse edge and graph is oriented
        hasReverseEdge = true;
      }
      // Create new edge view from imported edge view
      let newEdgeView: EdgeView = this.edgeFabric.createFromImportedEdgeView(graph.graph.orientation, edgeView[1], hasReverseEdge);
      // Add edge view to graph view
      this.addEdgeToGraphView(this.currentGraphView, newEdgeView);
    });
  }

  /**
   * Generate graph view from graph model.
   * Deletes old graph view and creates new one.
   */
  public generateGraphView(newGraph: Graph): void {
    // Clear old graph view elements from canvas and memory
    this.clearAllElementsView(this.currentGraphView);
    // Replace current graph with new one
    this.currentGraph = newGraph;
    // Create new graph view elements by default generator
    const generator = this.createGraphViewGenerator(newGraph.type);
    const result = generator.generateGraphViewElements(newGraph);
    const nodeViews = result.nodes;
    const edgeViews = result.edges;
    const graphView = new GraphView(newGraph);
    // Populate graph view with new elements
    this.populateGraphView(graphView, nodeViews, edgeViews, false); // Do not call model service methods, because it is already called
    console.log("Graph orientation: " + newGraph.orientation);
    this.changeGraphOrientation(graphView, newGraph.orientation); // Change orientation (to update state on UI)
    this.stateService.graphViewGenerated(); // Notify state service about graph view generation
  }

  private createGraphViewGenerator(graphType: GraphType): GraphViewGenerator {
    switch (graphType.toString()) {
      case 'Default': return new DefaultGraphViewGenerator(this.pixiService, this.nodeFabric, this.edgeFabric);
      case 'Tree': return new TreeGraphViewGenerator(this.pixiService, this.nodeFabric, this.edgeFabric);
    }
    throw new Error('Graph type not supported');
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
      this.nodeFabric.changeToStyleAndSave(element, ConfService.SELECTED_GRAPH_STYLE(element).nodeStyle);
      this.moveNodeView(element, element.coordinates);
    } else if (element instanceof EdgeView) {
      this.edgeFabric.changeToStyleAndSave(element, ConfService.SELECTED_GRAPH_STYLE(undefined, element)
        .edgeStyle);
      this.stateService.changeFloatHelperItem(EDIT_EDGE_WEIGHT_MODE_HELPER_ITEM); // Change float helper item
    }
    this.stateService.elementSelected(element); // Notify state service
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
      this.nodeFabric.changeToStyleAndSave(element, element.nodeStyle);
      this.moveNodeView(element, element.coordinates);
    } else if (element instanceof EdgeView) {
      this.edgeFabric.changeToPreviousStyle(element);
      // TODO Create helperService to manage helper items
      this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM); // Change float helper item
    }
    this.stateService.elementUnselected(element); // Notify state service
  }

  /**
   * Clears the selection of all elements.
   */
  public clearSelection() {
    this._selectedElements.forEach((element: GraphElement) => {
      if (element instanceof NodeView) {
        this.nodeFabric.changeToStyleAndSave(element, element.nodeStyle);
        this.moveNodeView(element, element.coordinates);
      } else if (element instanceof EdgeView) {
        this.edgeFabric.changeToPreviousStyle(element);
      }
    });
    this._selectedElements = [];
    this.stateService.changeFloatHelperItem(DEFAULT_HELPER_ITEM); // Change float helper item
    this.stateService.selectionCleared(); // Notify state service
  }

  /**
   * Returns whether the selection is empty.
   */
  public isSelectionEmpty(): boolean {
    return this._selectedElements.length === 0;
  }

  /**
   * Returns the selected elements.
   * Returns the selected node views and edge views as GraphElements.
   */
  public getSelectedElements(): GraphElement[] {
    const selectedElements: GraphElement[] = [];
    this._selectedElements.forEach((element: GraphElement) => {
      if (element instanceof NodeView) {
        const node = this.currentGraphView.nodeViews.get(element.node.index);
        if (node) {
          selectedElements.push(node);
        }
      } else if (element instanceof EdgeView) {
        const edge = this.currentGraphView.edgeViews.get(element.edge.edgeIndex.value);
        if (edge) {
          selectedElements.push(edge);
        }
      }
    });
    return selectedElements;
  }

  private removeAdjacentEdges(graphView: GraphView, nodeView: NodeView) {
    let adjacentEdges: EdgeView[] = this.getAdjacentEdgeViews(graphView, nodeView);
    adjacentEdges.forEach((edgeView: EdgeView) => {
      this.removeEdgeFromGraphView(graphView, edgeView);
    });
  }

  get selectedElements(): GraphElement[] {
    return this._selectedElements;
  }

  get nodeViews(): Map<number, NodeView> {
    return this._currentGraphView!.nodeViews;
  }

  get edgeViews(): Map<string, EdgeView> {
    return this._currentGraphView!.edgeViews;
  }

  get currentGraph(): Graph {
    return <Graph>this._currentGraphView?.graph;
  }

  set currentGraph(value: Graph) {
    this._currentGraphView!.graph = value;
  }

  get currentGraphView(): GraphView {
    return <GraphView>this._currentGraphView;
  }

  set currentGraphView(value: GraphView) {
    this._currentGraphView = value;
  }
}
