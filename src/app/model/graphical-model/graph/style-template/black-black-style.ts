import {GraphViewStyle} from "../graph-view-properties";
import {DefaultRadius} from "../../node/radius";

/**
 * Default style for the graph view
 */
export function BLACK_BLACK_STYLE(): GraphViewStyle {
  return {
    name: 'Black&Black',
    nodeStyle: {
      radius: new DefaultRadius(20),
      fillNode: '#000000',
      strokeColor: '#FFFFFF',
      strokeWidth: 4,
      labelStyle: {
        labelColor: '#FFFFFF',
        labelFontSize: 18,
        labelFontFamily: 'Nunito Sans',
        labelFontWeight: 'bold'
      }
    },
    edgeStyle: {
      strokeColor: '#000000',
      strokeWidth: 6,
      arrow: {
        size: 20,
        color: '#000000',
        strokeWidth: 0,
        strokeColor: '#000000'
      },
      weight: {
        color: 'white',
        strokeWidth: 5,
        strokeColor: '#000000',
        text: {
          size: 18,
          labelColor: '#000000',
          labelFontFamily: 'Nunito Sans',
          labelFontWeight: 'bold'
        }
      }
    }
  }
}
