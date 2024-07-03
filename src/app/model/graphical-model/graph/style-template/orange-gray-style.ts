import {GraphViewStyle} from "../graph-view-properties";
import {DefaultRadius} from "../../node/radius";

/**
 * Default style for the graph view
 */
export function ORANGE_GRAY_STYLE(): GraphViewStyle {
  return {
    name: 'Orange&Gray',
    nodeStyle: {
      radius: new DefaultRadius(20),
      fillNode: '#F3AF3D',
      strokeColor: '#000000',
      strokeWidth: 0,
      labelStyle: {
        labelColor: '#000000',
        labelFontSize: 20,
        labelFontFamily: 'Nunito Sans',
        labelFontWeight: 'bold'
      }
    },
    edgeStyle: {
      strokeColor: '#D6D6D6',
      strokeWidth: 5,
      arrow: {
        size: 20,
        color: '#D6D6D6',
        strokeWidth: 0,
        strokeColor: '#D6D6D6'
      },
      weight: {
        color: 'white',
        strokeWidth: 5,
        strokeColor: '#D6D6D6',
        text: {
          size: 20,
          labelColor: '#D6D6D6',
          labelFontFamily: 'Nunito Sans',
          labelFontWeight: 'bold'
        }
      }
    }
  }
}
