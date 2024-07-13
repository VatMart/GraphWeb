import {GraphViewService} from "../service/graph/graph-view.service";
import {CustomizationFormValues} from "../component/tab-nav/customization-view/customization-view.component";
import {GraphViewPropertiesService} from "../service/graph/graph-view-properties.service";
import {ConfService} from "../service/config/conf.service";
import {NodeView} from "../model/graphical-model/node/node-view";
import {DynamicRadius} from "../model/graphical-model/node/radius";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {GraphElement} from "../model/graphical-model/graph-element";
import {EdgeViewFabricService} from "../service/fabric/edge-view-fabric.service";

/**
 * Customization form values resolver.
 * Goal of this class is to get the form values and resolve which methods of the graph service should be called.
 */
export class CustomizationResolver {

  constructor(private graphService: GraphViewService,
              private propertiesService: GraphViewPropertiesService,
              private edgeFabric: EdgeViewFabricService) {
  }

  /**
   * Resolve the form values.
   * @param value form values
   */
  resolveGlobal(value: Partial<CustomizationFormValues>): Action[] {
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
  resolveGlobalRollback(value: Partial<CustomizationFormValues>): Action[] {
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

  /**
   * Resolve the form values for specific elements.
   */
  resolveSpecific(value: Partial<CustomizationFormValues>, elements: GraphElement[]): Action[] {
    const actions: Action[] = [];
    const copy = Array.from(elements);
    const copyValues = Object.assign({}, value);
    // Node colors
    if (copyValues.nodeColor !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof NodeView) {
            this.propertiesService.changeNodeColor(element, copyValues.nodeColor!);
          }
        });
      });
    }
    if (copyValues.nodeStrokeColor !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof NodeView) {
            this.propertiesService.changeNodeStrokeColor(element, copyValues.nodeStrokeColor!);
          }
        });
      });
    }
    if (copyValues.nodeLabelColor !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof NodeView) {
            this.propertiesService.changeNodeLabelColor(element, copyValues.nodeLabelColor!);
          }
        });
      });
    }
    // Node sizes
    if (copyValues.nodeRadius !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof NodeView) {
            this.propertiesService.changeNodeRadius(element, copyValues.nodeRadius!);
          }
        });
      });
    }
    if (copyValues.nodeStrokeWidth !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof NodeView) {
            this.propertiesService.changeNodeStrokeWidth(element, copyValues.nodeStrokeWidth!);
          }
        });
      });
    }
    if (copyValues.nodeLabelFontSize !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof NodeView) {
            this.propertiesService.changeNodeLabelSize(element, copyValues.nodeLabelFontSize!);
          }
        });
      });
    }
    // Edge colors
    if (copyValues.edgeColor !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof EdgeView) {
            this.propertiesService.changeEdgeColor(element, copyValues.edgeColor!);
          }
        });
      });
    }
    if (copyValues.edgeWeightColor !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof EdgeView) {
            this.propertiesService.changeEdgeWeightColor(element, copyValues.edgeWeightColor!);
          }
        });
      });
    }
    if (copyValues.edgeArrowColor !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof EdgeView) {
            this.propertiesService.changeEdgeArrowColor(element, copyValues.edgeArrowColor!);
          }
        });
      });
    }
    // Edge sizes
    if (copyValues.edgeStrokeWidth !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof EdgeView) {
            this.propertiesService.changeEdgeStrokeWidth(element, copyValues.edgeStrokeWidth!);
          }
        });
      });
    }
    if (copyValues.edgeWeightSize !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof EdgeView) {
            this.propertiesService.changeEdgeWeightSize(element, copyValues.edgeWeightSize!);
          }
        });
      });
    }
    if (copyValues.edgeArrowSize !== undefined) {
      actions.push(() => {
        copy.forEach(element => {
          if (element instanceof EdgeView) {
            this.propertiesService.changeEdgeArrowSize(element, copyValues.edgeArrowSize!);
          }
        });
      });
    }
    return actions;
  }

  /**
   * Resolve the form values rollback actions for specific elements.
   */
  resolveSpecificRollback(value: Partial<CustomizationFormValues>, elements: GraphElement[]): Action[] {
    const actions: Action[] = [];
    const copy = Array.from(elements);
    const copyValues = Object.assign({}, value);
    // Node colors
    if (copyValues.nodeColor !== undefined) {
      const nodeColors = new Map<NodeView, string>();
      copy.forEach(element => {
        if (element instanceof NodeView) {
          nodeColors.set(element, element.nodeStyle.fillNode);
        }
      });
      actions.push(() => {
        nodeColors.forEach((color, nodeView) => {
          this.propertiesService.changeNodeColor(nodeView, color);
        });
      });
    }
    if (copyValues.nodeStrokeColor !== undefined) {
      const nodeStrokeColors = new Map<NodeView, string>();
      copy.forEach(element => {
        if (element instanceof NodeView) {
          nodeStrokeColors.set(element, element.nodeStyle.strokeColor);
        }
      });
      actions.push(() => {
        nodeStrokeColors.forEach((color, nodeView) => {
          this.propertiesService.changeNodeStrokeColor(nodeView, color);
        });
      });
    }
    if (copyValues.nodeLabelColor !== undefined) {
      const nodeLabelColors = new Map<NodeView, string>();
      copy.forEach(element => {
        if (element instanceof NodeView) {
          nodeLabelColors.set(element, element.nodeStyle.labelStyle.labelColor);
        }
      });
      actions.push(() => {
        nodeLabelColors.forEach((color, nodeView) => {
          this.propertiesService.changeNodeLabelColor(nodeView, color);
        });
      });
    }
    // Node sizes
    if (copyValues.nodeRadius !== undefined) {
      const nodesRadius = new Map<NodeView, number>();
      copy.forEach(element => {
        if (element instanceof NodeView) {
          nodesRadius.set(element, (element.nodeStyle.radius instanceof DynamicRadius) ?
            element.nodeStyle.radius.baseValue : element.radius);
        }
      });
      actions.push(() => {
        nodesRadius.forEach((radius, nodeView) => {
          this.propertiesService.changeNodeRadius(nodeView, radius);
        });
      });
    }
    if (copyValues.nodeStrokeWidth !== undefined) {
      const nodesStrokeWidth = new Map<NodeView, number>();
      copy.forEach(element => {
        if (element instanceof NodeView) {
          nodesStrokeWidth.set(element, element.nodeStyle.strokeWidth);
        }
      });
      actions.push(() => {
        nodesStrokeWidth.forEach((strokeWidth, nodeView) => {
          this.propertiesService.changeNodeStrokeWidth(nodeView, strokeWidth);
        });
      });
    }
    if (copyValues.nodeLabelFontSize !== undefined) {
      const nodesLabelFontSize = new Map<NodeView, number>();
      copy.forEach(element => {
        if (element instanceof NodeView) {
          nodesLabelFontSize.set(element, element.nodeStyle.labelStyle.labelFontSize);
        }
      });
      actions.push(() => {
        nodesLabelFontSize.forEach((labelFontSize, nodeView) => {
          this.propertiesService.changeNodeLabelSize(nodeView, labelFontSize);
        });
      });
    }
    // Edge colors
    if (copyValues.edgeColor !== undefined) {
      const edgesColors = new Map<EdgeView, string>();
      copy.forEach(element => {
        if (element instanceof EdgeView) {
          let strokeColor = element.edgeStyle.strokeColor;
          if (this.graphService.isElementSelected(element)) {
            const previousStyle = this.edgeFabric.getPreviousStyle(element);
            if (previousStyle) {
              strokeColor = previousStyle.strokeColor;
            }
          }
          edgesColors.set(element, strokeColor);
        }
      });
      actions.push(() => {
        edgesColors.forEach((color, edgeView) => {
          this.propertiesService.changeEdgeColor(edgeView, color);
        });
      });
    }
    if (copyValues.edgeWeightColor !== undefined) {
      const edgesWeightColors = new Map<EdgeView, string>();
      copy.forEach(element => {
        if (element instanceof EdgeView) {
          let strokeColor = element.edgeStyle.weight.strokeColor;
          if (this.graphService.isElementSelected(element)) {
            const previousStyle = this.edgeFabric.getPreviousStyle(element);
            if (previousStyle) {
              strokeColor = previousStyle.weight.strokeColor;
            }
          }
          edgesWeightColors.set(element, strokeColor);
        }
      });
      actions.push(() => {
        edgesWeightColors.forEach((color, edgeView) => {
          this.propertiesService.changeEdgeWeightColor(edgeView, color);
        });
      });
    }
    if (copyValues.edgeArrowColor !== undefined) {
      const edgesArrowColors = new Map<EdgeView, string>();
      copy.forEach(element => {
        if (element instanceof EdgeView) {
          let strokeColor = element.edgeStyle.arrow.strokeColor;
          if (this.graphService.isElementSelected(element)) {
            const previousStyle = this.edgeFabric.getPreviousStyle(element);
            if (previousStyle) {
              strokeColor = previousStyle.arrow.strokeColor;
            }
          }
          edgesArrowColors.set(element, strokeColor);
        }
      });
      actions.push(() => {
        edgesArrowColors.forEach((color, edgeView) => {
          this.propertiesService.changeEdgeArrowColor(edgeView, color);
        });
      });
    }
    // Edge sizes
    if (copyValues.edgeStrokeWidth !== undefined) {
      const edgesStrokeWidth = new Map<EdgeView, number>();
      copy.forEach(element => {
        if (element instanceof EdgeView) {
          edgesStrokeWidth.set(element, element.edgeStyle.strokeWidth);
        }
      });
      actions.push(() => {
        edgesStrokeWidth.forEach((strokeWidth, edgeView) => {
          this.propertiesService.changeEdgeStrokeWidth(edgeView, strokeWidth);
        });
      });
    }
    if (copyValues.edgeWeightSize !== undefined) {
      const edgesWeightSize = new Map<EdgeView, number>();
      copy.forEach(element => {
        if (element instanceof EdgeView) {
          edgesWeightSize.set(element, element.edgeStyle.weight.text.size);
        }
      });
      actions.push(() => {
        edgesWeightSize.forEach((weightSize, edgeView) => {
          this.propertiesService.changeEdgeWeightSize(edgeView, weightSize);
        });
      });
    }
    if (copyValues.edgeArrowSize !== undefined) {
      const edgesArrowSize = new Map<EdgeView, number>();
      copy.forEach(element => {
        if (element instanceof EdgeView) {
          edgesArrowSize.set(element, element.edgeStyle.arrow.size);
        }
      });
      actions.push(() => {
        edgesArrowSize.forEach((arrowSize, edgeView) => {
          this.propertiesService.changeEdgeArrowSize(edgeView, arrowSize);
        });
      });
    }
    return actions;
  }
}

export interface Action {
  (): void;
}
