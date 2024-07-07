import {GraphViewService} from "../service/graph/graph-view.service";
import {CustomizationFormValues} from "../component/tab-nav/customization-view/customization-view.component";
import {GraphViewPropertiesService} from "../service/graph/graph-view-properties.service";
import {ConfService} from "../service/config/conf.service";
import {NodeView} from "../model/graphical-model/node/node-view";
import {DynamicRadius} from "../model/graphical-model/node/radius";
import {EdgeView} from "../model/graphical-model/edge/edge-view";

/**
 * Customization form values resolver.
 * Goal of this class is to get the form values and resolve which methods of the graph service should be called.
 */
export class CustomizationResolver {

  constructor(private graphService: GraphViewService,
              private propertiesService: GraphViewPropertiesService) {

  }

  /**
   * Resolve the form values.
   * @param value form values
   */
  resolve(value: Partial<CustomizationFormValues>): Action[] {
    const actions: Action[] = [];
    // Node colors
    if (value.nodeColor !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesColor(value.nodeColor!));
    }
    if (value.nodeStrokeColor !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesStrokeColor(value.nodeStrokeColor!));
    }
    if (value.nodeLabelColor !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesLabelColor(value.nodeLabelColor!));
    }
    // Node sizes
    if (value.nodeRadius !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesRadius(value.nodeRadius!));
    }
    if (value.nodeStrokeWidth !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesStrokeWidth(value.nodeStrokeWidth!));
    }
    if (value.nodeLabelFontSize !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesLabelSize(value.nodeLabelFontSize!));
    }
    // Node properties
    if (value.dynamicNodeSize !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesDynamicSize(value.dynamicNodeSize!));
    }
    if (value.showNodeLabel !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentNodesLabelVisibility(value.showNodeLabel!));
    }
    // Edge colors
    if (value.edgeColor !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentEdgesColor(value.edgeColor!));
    }
    if (value.edgeWeightColor !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentEdgesWeightColor(value.edgeWeightColor!));
    }
    if (value.edgeArrowColor !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentEdgesArrowColor(value.edgeArrowColor!));
    }
    // Edge sizes
    if (value.edgeStrokeWidth !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentEdgesStrokeWidth(value.edgeStrokeWidth!));
    }
    if (value.edgeWeightSize !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentEdgesWeightSize(value.edgeWeightSize!));
    }
    if (value.edgeArrowSize !== undefined) {
      actions.push(() => this.propertiesService.changeCurrentEdgesArrowSize(value.edgeArrowSize!));
    }
    // Edge properties
    if (value.showEdgeWeight !== undefined) {
      actions.push(() => this.propertiesService.changeEdgeWeightsVisibility(value.showEdgeWeight!));
    }
    if (value.dynamicEdgeWeight !== undefined) {
      // TODO implement dynamic edge weight
    }
    return actions;
  }

  /**
   * Resolve the form values rollback actions.
   * Its purpose is to revert the changes made by the form values.
   */
  resolveRollback(value: Partial<CustomizationFormValues>): Action[] {
    const actions: Action[] = [];
    // Node colors
    if (value.nodeColor !== undefined) {
      const nodeColors = new Map<NodeView, string>();
      this.graphService.nodeViews.forEach(nodeView => { // Save current colors
        nodeColors.set(nodeView, nodeView.nodeStyle.fillNode);
      });
      const param = ConfService.currentNodeStyle.fillNode; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.nodeStyle.fillNode = param;
        nodeColors.forEach((color, nodeView) => {
          this.propertiesService.changeNodeColor(nodeView, color);
        });
      });
    }
    if (value.nodeStrokeColor !== undefined) {
      const nodeStrokeColors = new Map<NodeView, string>();
      this.graphService.nodeViews.forEach(nodeView => { // Save current colors
        nodeStrokeColors.set(nodeView, nodeView.nodeStyle.strokeColor);
      });
      const param = ConfService.currentNodeStyle.strokeColor; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.nodeStyle.strokeColor = param;
        nodeStrokeColors.forEach((color, nodeView) => {
          this.propertiesService.changeNodeStrokeColor(nodeView, color);
        });
      });
    }
    if (value.nodeLabelColor !== undefined) {
      const nodeLabelColors = new Map<NodeView, string>();
      this.graphService.nodeViews.forEach(nodeView => { // Save current colors
        nodeLabelColors.set(nodeView, nodeView.nodeStyle.labelStyle.labelColor);
      });
      const param = ConfService.currentNodeStyle.labelStyle.labelColor; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.nodeStyle.labelStyle.labelColor = param;
        nodeLabelColors.forEach((color, nodeView) => {
          this.propertiesService.changeNodeLabelColor(nodeView, color);
        });
      });
    }
    // Node sizes
    if (value.nodeRadius !== undefined) {
      const nodesRadius = new Map<NodeView, number>();
      this.graphService.nodeViews.forEach(nodeView => { // Save current radius
        nodesRadius.set(nodeView, (nodeView.nodeStyle.radius instanceof DynamicRadius) ?
          nodeView.nodeStyle.radius.baseValue : nodeView.radius);
      });
      const param = ConfService.currentNodeStyle.radius.getRadius(); // To not save reference of config value in the action
      const param2 = Math.max(160, param * 6); // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.nodeStyle.radius.setRadius(param);
        ConfService.MAX_DISTANCE_FORCE = param2;
        nodesRadius.forEach((radius, nodeView) => {
          this.propertiesService.changeNodeRadius(nodeView, radius);
        });
      });
    }
    if (value.nodeStrokeWidth !== undefined) {
      const nodesStrokeWidth = new Map<NodeView, number>();
      this.graphService.nodeViews.forEach(nodeView => { // Save current stroke width
        nodesStrokeWidth.set(nodeView, nodeView.nodeStyle.strokeWidth);
      });
      const param = ConfService.currentNodeStyle.strokeWidth; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.nodeStyle.strokeWidth = param;
        nodesStrokeWidth.forEach((strokeWidth, nodeView) => {
          this.propertiesService.changeNodeStrokeWidth(nodeView, strokeWidth);
        });
      });
    }
    if (value.nodeLabelFontSize !== undefined) {
      const nodesLabelFontSize = new Map<NodeView, number>();
      this.graphService.nodeViews.forEach(nodeView => { // Save current label font size
        nodesLabelFontSize.set(nodeView, nodeView.nodeStyle.labelStyle.labelFontSize);
      });
      const param = ConfService.currentNodeStyle.labelStyle.labelFontSize; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.nodeStyle.labelStyle.labelFontSize = param;
        nodesLabelFontSize.forEach((labelFontSize, nodeView) => {
          this.propertiesService.changeNodeLabelSize(nodeView, labelFontSize);
        });
      });
    }
    // Node properties
    if (value.dynamicNodeSize !== undefined) {
      const param = ConfService.DYNAMIC_NODE_SIZE; // To not save reference of config value in the action
      actions.push(() => this.propertiesService.changeCurrentNodesDynamicSize(param));
    }
    if (value.showNodeLabel !== undefined) {
      const param = ConfService.SHOW_NODE_LABEL; // To not save reference of config value in the action
      actions.push(() => this.propertiesService.changeCurrentNodesLabelVisibility(param));
    }
    // Edge colors
    if (value.edgeColor !== undefined) {
      const edgesColors = new Map<EdgeView, string>();
      this.graphService.edgeViews.forEach(edgeView => { // Save current colors
        edgesColors.set(edgeView, edgeView.edgeStyle.strokeColor);
      });
      const param = ConfService.currentEdgeStyle.strokeColor; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.strokeColor = param;
        edgesColors.forEach((color, edgeView) => {
          this.propertiesService.changeEdgeColor(edgeView, color);
        });
      });
    }
    if (value.edgeWeightColor !== undefined) {
      const edgesWeightColors = new Map<EdgeView, string>();
      this.graphService.edgeViews.forEach(edgeView => { // Save current colors
        edgesWeightColors.set(edgeView, edgeView.edgeStyle.weight.strokeColor);
      });
      const param = ConfService.currentEdgeStyle.weight.strokeColor; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.weight.strokeColor = param;
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.weight.text.labelColor = param;
        edgesWeightColors.forEach((color, edgeView) => {
          this.propertiesService.changeEdgeWeightColor(edgeView, color);
        });
      });
    }
    if (value.edgeArrowColor !== undefined) {
      const edgesArrowColors = new Map<EdgeView, string>();
      this.graphService.edgeViews.forEach(edgeView => { // Save current colors
        edgesArrowColors.set(edgeView, edgeView.edgeStyle.arrow.strokeColor);
      });
      const param = ConfService.currentEdgeStyle.arrow.strokeColor; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.arrow.strokeColor = param;
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.arrow.color = param;
        edgesArrowColors.forEach((color, edgeView) => {
          this.propertiesService.changeEdgeArrowColor(edgeView, color);
        });
      });
    }
    // Edge sizes
    if (value.edgeStrokeWidth !== undefined) {
      const edgesStrokeWidth = new Map<EdgeView, number>();
      this.graphService.edgeViews.forEach(edgeView => { // Save current stroke width
        edgesStrokeWidth.set(edgeView, edgeView.edgeStyle.strokeWidth);
      });
      const param = ConfService.currentEdgeStyle.strokeWidth; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.strokeWidth = param;
        edgesStrokeWidth.forEach((strokeWidth, edgeView) => {
          this.propertiesService.changeEdgeStrokeWidth(edgeView, strokeWidth);
        });
      });
    }
    if (value.edgeWeightSize !== undefined) {
      const edgesWeightSize = new Map<EdgeView, number>();
      this.graphService.edgeViews.forEach(edgeView => { // Save current weight size
        edgesWeightSize.set(edgeView, edgeView.edgeStyle.weight.text.size);
      });
      const param = ConfService.currentEdgeStyle.weight.text.size; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.weight.text.size = param;
        edgesWeightSize.forEach((weightSize, edgeView) => {
          this.propertiesService.changeEdgeWeightSize(edgeView, weightSize);
        });
      });
    }
    if (value.edgeArrowSize !== undefined) {
      const edgesArrowSize = new Map<EdgeView, number>();
      this.graphService.edgeViews.forEach(edgeView => { // Save current arrow size
        edgesArrowSize.set(edgeView, edgeView.edgeStyle.arrow.size);
      });
      const param = ConfService.currentEdgeStyle.arrow.size; // To not save reference of config value in the action
      actions.push(() => {
        ConfService.CURRENT_GRAPH_STYLE.edgeStyle.arrow.size = param;
        edgesArrowSize.forEach((arrowSize, edgeView) => {
          this.propertiesService.changeEdgeArrowSize(edgeView, arrowSize);
        });
      });
    }
    // Edge properties
    if (value.showEdgeWeight !== undefined) {
      const param = ConfService.SHOW_WEIGHT; // To not save reference of config value in the action
      actions.push(() => this.propertiesService.changeEdgeWeightsVisibility(param));
    }
    if (value.dynamicEdgeWeight !== undefined) {
      // TODO implement dynamic edge weight
    }
    return actions;
  }
}

export interface Action {
  (): void;
}
