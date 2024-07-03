import {GraphViewStyle} from "../graph-view-properties";
import {DefaultRadius} from "../../node/radius";

/**
 * Orange and Blue style for the graph view
 */
export function ORANGE_BLUE_STYLE(): GraphViewStyle {
  return {
    name: 'Orange&Blue',
    nodeStyle: {
      radius: new DefaultRadius(20),
      fillNode: '#FFBA00',
      strokeColor: '#FFFFFF',
      strokeWidth: 2,
      labelStyle: {
        labelColor: '#000000',
        labelFontSize: 20,
        labelFontFamily: 'Nunito Sans',
        labelFontWeight: 'bold'
      }
    },
    edgeStyle: {
      strokeColor: '#009BFF',
      strokeWidth: 6,
      arrow: {
        size: 20,
        color: '#009BFF',
        strokeWidth: 0,
        strokeColor: '#009BFF'
      },
      weight: {
        color: 'white',
        strokeWidth: 5,
        strokeColor: '#009BFF',
        text: {
          size: 18,
          labelColor: '#009BFF',
          labelFontFamily: 'Nunito Sans',
          labelFontWeight: 'bold'
        }
      }
    }
  }
}
