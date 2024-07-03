import {GraphViewStyle} from "../graph-view-properties";
import {DefaultRadius} from "../../node/radius";

/**
 * Blue and Orange style for the graph view
 */
export function BLUE_ORANGE_STYLE(): GraphViewStyle {
  return {
    name: 'Blue&Orange',
    nodeStyle: {
      radius: new DefaultRadius(20),
      fillNode: '#009BFF',
      strokeColor: '#FFFFFF',
      strokeWidth: 2,
      labelStyle: {
        labelColor: '#FFFFFF',
        labelFontSize: 20,
        labelFontFamily: 'Nunito Sans',
        labelFontWeight: 'bold'
      }
    },
    edgeStyle: {
      strokeColor: '#FFBA00',
      strokeWidth: 6,
      arrow: {
        size: 20,
        color: '#FFBA00',
        strokeWidth: 0,
        strokeColor: '#FFBA00'
      },
      weight: {
        color: 'white',
        strokeWidth: 5,
        strokeColor: '#FFBA00',
        text: {
          size: 18,
          labelColor: '#FFBA00',
          labelFontFamily: 'Nunito Sans',
          labelFontWeight: 'bold'
        }
      }
    }
  }
}
