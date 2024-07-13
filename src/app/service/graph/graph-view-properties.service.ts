import {Injectable} from '@angular/core';
import {GraphViewService} from "./graph-view.service";
import {ConfService} from "../config/conf.service";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {StateService} from "../event/state.service";
import {DefaultRadius, DynamicRadius} from "../../model/graphical-model/node/radius";
import {NodeViewFabricService} from "../fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../fabric/edge-view-fabric.service";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {style} from "@angular/animations";
import {EdgeStyle} from "../../model/graphical-model/graph/graph-view-properties";

/**
 * Service for managing the properties of the graph view.
 * Such as colors, sizes of node/edge, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class GraphViewPropertiesService {

  constructor(private graphService: GraphViewService,
              private stateService: StateService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
  }

  /**
   * Changes the label of the node.
   */
  public changeNodeLabel(nodeView: NodeView, newLabel: string) {
    if (nodeView.node.label === newLabel) {
      return;
    }
    if (newLabel.length === 0) { // If label is empty, set index as label
      nodeView.node.label = '';
      nodeView.text.text = nodeView.node.index.toString();
      return;
    }
    nodeView.node.label = newLabel;
    nodeView.text.text = newLabel;
  }

  /**
   * Changes the weight of the given edge view.
   */
  public changeEdgeViewWeight(edgeView: EdgeView, weight: number) {
    edgeView.changeEdgeWeight(weight);
    this.edgeFabric.updateEdgeViewWeightTexture(edgeView); // Update texture, to resize text box
    this.stateService.edgeWeightChanged(edgeView);
  }

  // ------------------- Styles related methods -------------------
  /**
   * Changes the visibility of the edge weights. Changes the visibility of all edge weights and default value
   * for new edges.
   */
  public changeEdgeWeightsVisibility(visible: boolean) {
    console.log("Change edge weights visibility: " + visible);
    ConfService.SHOW_WEIGHT = visible;
    this.graphService.edgeViews.forEach((edgeView: EdgeView) => {
      if (edgeView.weightVisible !== visible) {
        edgeView.changeWeightVisible(visible);
      }
    });
  }

  /**
   * Changes dynamic size of nodes behavior.
   * See DynamicRadius for more details.
   */
  public changeCurrentNodesDynamicSize(dynamicNodeSize: boolean) {
    if (ConfService.DYNAMIC_NODE_SIZE === dynamicNodeSize) {
      return;
    }
    ConfService.DYNAMIC_NODE_SIZE = dynamicNodeSize;
    this.graphService.nodeViews.forEach(nodeView => {
      if (dynamicNodeSize && !(nodeView.nodeStyle.radius instanceof DynamicRadius)) { // Set dynamic radius
        nodeView.nodeStyle.radius = new DynamicRadius(nodeView.radius, nodeView.node.getAdjacentEdges().length);
      } else if (!dynamicNodeSize) { // Set default radius
        const radius = (nodeView.nodeStyle.radius instanceof DynamicRadius) ?
          nodeView.nodeStyle.radius.baseValue : nodeView.radius;
        nodeView.nodeStyle.radius = new DefaultRadius(radius);
      }
      this.graphService.updateRadiusNodes(nodeView);
    });
  }

  /**
   * Changes the visibility of the node labels.
   */
  public changeCurrentNodesLabelVisibility(labelVisible: boolean) {
    if (ConfService.SHOW_NODE_LABEL === labelVisible) {
      return;
    }
    ConfService.SHOW_NODE_LABEL = labelVisible;
    this.graphService.nodeViews.forEach(nodeView => {
      nodeView.changeLabelVisible(labelVisible);
    });
  }

  /**
   * Changes the fill color of the current nodes.
   * This will change the color of all nodes in the graph.
   * And will be saved as default color for new nodes.
   */
  public changeCurrentNodesColor(color: string) {
    ConfService.currentNodeStyle.fillNode = color;
    // Change color of all nodes
    this.graphService.nodeViews.forEach(nodeView => {
      this.changeNodeColor(nodeView, color);
    });
  }

  /**
   * Change the fill color of particular node.
   */
  public changeNodeColor(node: NodeView, color: string) {
    const selected = this.graphService.isElementSelected(node);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(node);
    }
    node.nodeStyle.fillNode = color;
    this.nodeFabric.updateTexture(node);
    if (selected) { // Select node back
      this.graphService.selectElement(node);
    }
  }

  /**
   * Changes the stroke color of the current nodes.
   * This will change the color of all nodes in the graph.
   * And will be saved as default color for new nodes.
   */
  changeCurrentNodesStrokeColor(color: string) {
    ConfService.currentNodeStyle.strokeColor = color;
    // Change stroke color of all nodes
    this.graphService.nodeViews.forEach(nodeView => {
      this.changeNodeStrokeColor(nodeView, color);
    });
  }

  /**
   * Change the stroke color of particular node.
   */
  public changeNodeStrokeColor(node: NodeView, color: string) {
    const selected = this.graphService.isElementSelected(node);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(node);
    }
    node.nodeStyle.strokeColor = color;
    this.nodeFabric.updateTexture(node);
    if (selected) { // Select node back
      this.graphService.selectElement(node);
    }
  }

  /**
   * Changes the label color of the current nodes.
   * This will change the color of all nodes in the graph.
   * And will be saved as default color for new nodes.
   */
  public changeCurrentNodesLabelColor(color: string) {
    ConfService.currentNodeStyle.labelStyle.labelColor = color;
    // Change label color of all nodes
    this.graphService.nodeViews.forEach(nodeView => {
      this.changeNodeLabelColor(nodeView, color);
    });
  }

  public changeNodeLabelColor(node: NodeView, color: string) {
    node.nodeStyle.labelStyle.labelColor = color;
    node.text.style.fill = color; // Pixi.Text can be changed dynamically
  }

  /**
   * Changes the radius of the current nodes.
   * This will change the radius of all nodes in the graph.
   */
  public changeCurrentNodesRadius(number: number) {
    ConfService.currentNodeStyle.radius.setRadius(number); // Save as default radius
    ConfService.MAX_DISTANCE_FORCE = Math.max(160, number * 6);
    // Change radius of all nodes
    this.graphService.nodeViews.forEach(nodeView => {
      this.changeNodeRadius(nodeView, number);
    });
  }

  /**
   * Changes the radius of particular node.
   */
  public changeNodeRadius(node: NodeView, number: number) {
    const selected = this.graphService.isElementSelected(node);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(node);
    }
    node.nodeStyle.radius.setRadius(number);
    this.nodeFabric.updateTexture(node);
    if (selected) { // Select node back
      this.graphService.selectElement(node);
    }
    // Move to update edge positions
    this.graphService.moveNodeView(node, node.coordinates);
  }

  /**
   * Changes the stroke width of the current nodes.
   * This will change the stroke width of all nodes in the graph.
   */
  public changeCurrentNodesStrokeWidth(nodeStrokeWidth: number) {
    ConfService.currentNodeStyle.strokeWidth = nodeStrokeWidth;
    // Change stroke width of all nodes
    this.graphService.nodeViews.forEach(nodeView => {
      this.changeNodeStrokeWidth(nodeView, nodeStrokeWidth);
    });
  }

  /**
   * Changes the stroke width of particular node.
   */
  public changeNodeStrokeWidth(nodeView: NodeView, nodeStrokeWidth: number) {
    const selected = this.graphService.isElementSelected(nodeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(nodeView);
    }
    nodeView.nodeStyle.strokeWidth = nodeStrokeWidth;
    this.nodeFabric.updateTexture(nodeView);
    if (selected) { // Select node back
      this.graphService.selectElement(nodeView);
    }
    // Move to update edge positions
    this.graphService.moveNodeView(nodeView, nodeView.coordinates);
  }

  /**
   * Changes the label font size of the current nodes.
   * This will change the label font size of all nodes in the graph.
   */
  public changeCurrentNodesLabelSize(number: number) {
    ConfService.currentNodeStyle.labelStyle.labelFontSize = number;
    // Change label font size of all nodes
    this.graphService.nodeViews.forEach(nodeView => {
      this.changeNodeLabelSize(nodeView, number);
    });
  }

  /**
   * Changes the label font size of particular node.
   */
  public changeNodeLabelSize(nodeView: NodeView, number: number) {
    nodeView.nodeStyle.labelStyle.labelFontSize = number;
    nodeView.text.style.fontSize = number; // Pixi.Text can be changed dynamically
  }

  /**
   * Changes the color of the edges.
   * This will change the color of all edges in the graph.
   */
  public changeCurrentEdgesColor(edgeColor: string) {
    ConfService.currentEdgeStyle.strokeColor = edgeColor;
    // Change color of all edges
    this.graphService.edgeViews.forEach(edgeView => {
      this.changeEdgeColor(edgeView, edgeColor);
    });
  }

  /**
   * Changes the color of particular edge.
   */
  public changeEdgeColor(edgeView: EdgeView, edgeColor: string) {
    const selected = this.graphService.isElementSelected(edgeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(edgeView);
    }
    edgeView.edgeStyle.strokeColor = edgeColor;
    // Since edge rendered as PIXI.Graphics, we dont need to update texture, but redraw it
    edgeView.move();
    if (selected) { // Select node back
      this.graphService.selectElement(edgeView);
    }
  }

  /**
   * Changes the color of the edge weights.
   * This will change the color of all edge weights in the graph.
   */
  public changeCurrentEdgesWeightColor(color: string) {
    ConfService.currentEdgeStyle.weight.strokeColor = color;
    ConfService.currentEdgeStyle.weight.text.labelColor = color;
    // Change color of all edge weights
    this.graphService.edgeViews.forEach(edgeView => {
      this.changeEdgeWeightColor(edgeView, color);
    });
  }

  /**
   * Changes the color of particular edge weight.
   */
  public changeEdgeWeightColor(edgeView: EdgeView, color: string) {
    const selected = this.graphService.isElementSelected(edgeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(edgeView);
    }
    edgeView.edgeStyle.weight.strokeColor = color;
    edgeView.edgeStyle.weight.text.labelColor = color;
    // Since edge weight rendered as Pixi.Sprite, we need to update texture
    this.edgeFabric.updateTexture(edgeView);
    edgeView.weightView.text.style.fill = color; // Pixi.Text can be changed dynamically
    if (selected) { // Select node back
      this.graphService.selectElement(edgeView);
    }
  }

  /**
   * Changes the color of the arrow of the edges.
   * This will change the color of all arrows in the graph.
   */
  public changeCurrentEdgesArrowColor(color: string) {
    ConfService.currentEdgeStyle.arrow.color = color;
    ConfService.currentEdgeStyle.arrow.strokeColor = color;
    // Change color of all arrows
    this.graphService.edgeViews.forEach(edgeView => {
      this.changeEdgeArrowColor(edgeView, color);
    });
  }

  /**
   * Changes the color of particular edge arrow.
   */
  public changeEdgeArrowColor(edgeView: EdgeView, color: string) {
    const selected = this.graphService.isElementSelected(edgeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(edgeView);
    }
    edgeView.edgeStyle.arrow.color = color;
    edgeView.edgeStyle.arrow.strokeColor = color;
    // Since edge arrow rendered as PIXI.Graphics, we dont need to update texture, but redraw it
    edgeView.move();
    if (selected) { // Select node back
      this.graphService.selectElement(edgeView);
    }
  }

  /**
   * Changes the stroke width of the edges.
   * This will change the stroke width of all edges in the graph.
   */
  public changeCurrentEdgesStrokeWidth(edgeStrokeWidth: number) {
    ConfService.currentEdgeStyle.strokeWidth = edgeStrokeWidth;
    // Change stroke width of all edges
    this.graphService.edgeViews.forEach(edgeView => {
      this.changeEdgeStrokeWidth(edgeView, edgeStrokeWidth);
    });
  }

  /**
   * Changes the stroke width of particular edge.
   */
  public changeEdgeStrokeWidth(edgeView: EdgeView, edgeStrokeWidth: number) {
    const selected = this.graphService.isElementSelected(edgeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(edgeView);
    }
    edgeView.edgeStyle.strokeWidth = edgeStrokeWidth;
    // Since edge rendered as PIXI.Graphics, we dont need to update texture, but redraw it
    edgeView.move();
    if (selected) { // Select node back
      this.graphService.selectElement(edgeView);
    }
  }

  /**
   * Changes the size of the eight of the edges.
   * This will change the size of all weight edges in the graph.
   */
  public changeCurrentEdgesWeightSize(number: number) {
    ConfService.currentEdgeStyle.weight.text.size = number;
    // Change size of all edge weights
    this.graphService.edgeViews.forEach(edgeView => {
      this.changeEdgeWeightSize(edgeView, number);
    });
  }

  /**
   * Changes the size of particular edge weight.
   */
  public changeEdgeWeightSize(edgeView: EdgeView, number: number) {
    const selected = this.graphService.isElementSelected(edgeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(edgeView);
    }
    edgeView.edgeStyle.weight.text.size = number;
    // Since edge weight rendered as Pixi.Sprite, we need to update texture
    edgeView.weightView.text.style.fontSize = number; // Pixi.Text can be changed dynamically
    this.edgeFabric.updateTexture(edgeView);
    if (selected) { // Select node back
      this.graphService.selectElement(edgeView);
    }
  }

  /**
   * Changes the size of the arrow of the edges.
   * This will change the size of all arrows in the graph.
   */
  public changeCurrentEdgesArrowSize(number: number) {
    ConfService.currentEdgeStyle.arrow.size = number;
    // Change size of all arrows
    this.graphService.edgeViews.forEach(edgeView => {
      this.changeEdgeArrowSize(edgeView, number);
    });
  }

  /**
   * Changes the size of particular edge arrow.
   */
  public changeEdgeArrowSize(edgeView: EdgeView, number: number) {
    const selected = this.graphService.isElementSelected(edgeView);
    if (selected) { // Unselect node to update texture
      this.graphService.unselectElement(edgeView);
    }
    edgeView.edgeStyle.arrow.size = number;
    // Since edge arrow rendered as PIXI.Graphics, we dont need to update texture, but redraw it
    edgeView.move();
    if (selected) { // Select node back
      this.graphService.selectElement(edgeView);
    }
  }
}
