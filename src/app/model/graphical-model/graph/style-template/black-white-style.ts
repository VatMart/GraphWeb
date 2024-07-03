import {GraphViewStyle} from "../graph-view-properties";
import {DefaultRadius} from "../../node/radius";

/**
 * Default style for the graph view
 */
export function BLACK_WHITE_STYLE(): GraphViewStyle {
  return {
    name: 'Black&White',
    nodeStyle: {
      radius: new DefaultRadius(30),
      fillNode: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      labelStyle: {
        labelColor: '#000000',
        labelFontSize: 24,
        labelFontFamily: 'Nunito Sans',
        labelFontWeight: 'bold'
      }
    },
    edgeStyle: {
      strokeColor: '#000000',
      strokeWidth: 8,
      arrow: {
        size: 25,
        color: '#000000',
        strokeWidth: 0,
        strokeColor: '#000000'
      },
      weight: {
        color: 'white',
        strokeWidth: 5,
        strokeColor: '#000000',
        text: {
          size: 20,
          labelColor: '#000000',
          labelFontFamily: 'Nunito Sans',
          labelFontWeight: 'bold'
        }
      }
    }
  }
}
