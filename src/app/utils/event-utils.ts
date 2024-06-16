import {NodeView} from "../model/graphical-model/node/node-view";
import {EdgeView} from "../model/graphical-model/edge/edge-view";
import {Weight} from "../model/graphical-model/edge/weight";

export class EventUtils {

  public static isNodeView(target: any): target is NodeView {
    return target instanceof NodeView;
  }

  public static isEdgeView(target: any): target is EdgeView {
    return target instanceof EdgeView;
  }

  public static isEdgeViewWeight(target: any): target is Weight {
    return target instanceof Weight;
  }

  public static getEventTargetType(target: any): string {
    if (EventUtils.isNodeView(target)) {
      return "NodeView";
    } else if (EventUtils.isEdgeView(target)) {
      return "EdgeView";
    } else if (EventUtils.isEdgeViewWeight(target)) {
      return "Weight";
    } else {
      return "Other";
    }
  }

  public static getGraphElement(target: any): NodeView | EdgeView | null {
    if (EventUtils.isNodeView(target)) {
      return target as NodeView;
    } else if (EventUtils.isEdgeView(target)) {
      return target as EdgeView;
    } else if (EventUtils.isEdgeViewWeight(target)) {
      return (target as Weight).parent as EdgeView; // Weight is a child of EdgeView
    } else {
      return null;
    }
  }
}
