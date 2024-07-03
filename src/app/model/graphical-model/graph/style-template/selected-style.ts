import {GraphViewStyle} from "../graph-view-properties";
import {ConfService} from "../../../../service/config/conf.service";
import {NodeView} from "../../node/node-view";
import {EdgeView} from "../../edge/edge-view";

/**
 * Selected style for the graph view;
 * Applies when a graph element is selected.
 */
export function selectedStyle(node?: NodeView, edge?: EdgeView): GraphViewStyle {
  return {
    name: 'SelectedStyle',
    nodeStyle: {
      radius: node ? node.nodeStyle.radius : ConfService.currentNodeStyle.radius,
      fillNode: node ? node.nodeStyle.fillNode : ConfService.currentNodeStyle.fillNode,
      strokeColor: '#006FFF',
      strokeWidth: Math.max(node ? node.nodeStyle.strokeWidth + 1 : ConfService.currentNodeStyle.strokeWidth + 1, 4),
      labelStyle: node ? node.nodeStyle.labelStyle : ConfService.currentNodeStyle.labelStyle
    },
    edgeStyle: {
      strokeColor: '#006FFF',
      strokeWidth: edge ? edge.edgeStyle.strokeWidth + 2 : ConfService.currentEdgeStyle.strokeWidth + 2,
      arrow: {
        size: edge ? edge.edgeStyle.arrow.size : ConfService.currentEdgeStyle.arrow.size,
        color: '#006FFF',
        strokeWidth: edge ? edge.edgeStyle.arrow.strokeWidth + 1 : ConfService.currentEdgeStyle.arrow.strokeWidth + 1,
        strokeColor: '#006FFF'
      },
      weight: {
        color: edge ? edge.edgeStyle.weight.color : ConfService.currentEdgeStyle.weight.color,
        strokeWidth: edge ? edge.edgeStyle.weight.strokeWidth + 1 : ConfService.currentEdgeStyle.weight.strokeWidth + 1,
        strokeColor: '#006FFF',
        text: {
          size: edge ? edge.edgeStyle.weight.text.size : ConfService.currentEdgeStyle.weight.text.size,
          labelColor: '#006FFF',
          labelFontFamily: edge ? edge.edgeStyle.weight.text.labelFontFamily :
            ConfService.currentEdgeStyle.weight.text.labelFontFamily,
          labelFontWeight: edge ? edge.edgeStyle.weight.text.labelFontWeight :
            ConfService.currentEdgeStyle.weight.text.labelFontWeight
        }
      }
    }
  }
}
