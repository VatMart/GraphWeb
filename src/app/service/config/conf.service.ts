import {Injectable} from '@angular/core';
import {NodeLabelStyle, NodeStyle} from "../../model/graphical-model/node/node-view";
import {ArrowStyle} from "../../model/graphical-model/edge/arrow";
import {WeightStyle, WeightTextStyle} from "../../model/graphical-model/edge/weight";
import {EdgeStyle} from "../../model/graphical-model/edge/edge-view";
import {GraphOrientation} from "../../model/orientation";

/**
 * Service for managing the configuration of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfService {

  // Properties of application
  // Styles
  public static DEFAULT_NODE_STYLE: NodeStyle = {
    fillNode: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3
  };

  public static DEFAULT_NODE_LABEL_STYLE: NodeLabelStyle = {
    labelColor: '#000000',
    labelFontSize: 24,
    labelFontFamily: 'Nunito Sans',
    labelFontWeight: 'bold'
  };

  public static SELECTED_NODE_STYLE: NodeStyle = {
    fillNode: ConfService.DEFAULT_NODE_STYLE.fillNode,
    strokeColor: '#006FFF',
    strokeWidth: ConfService.DEFAULT_NODE_STYLE.strokeWidth + 1
  };

  public static DEFAULT_ARROW_STYLE: ArrowStyle = {
    size: 25,
    color: 'black',
    strokeWidth: 0,
    strokeColor: 'black'
  };

  public static SELECTED_ARROW_STYLE: ArrowStyle = {
    size: 25,
    color: '#006FFF',
    strokeWidth: 1,
    strokeColor: '#006FFF'
  };

  public static DEFAULT_TEXT_WEIGHT_STYLE: WeightTextStyle = {
    size: 20,
    labelColor: 'black',
    labelFontFamily: 'Nunito Sans',
    labelFontWeight: 'bold'
  }

  public static SELECTED_TEXT_WEIGHT_STYLE: WeightTextStyle = {
    size: 20,
    labelColor: '#006FFF',
    labelFontFamily: 'Nunito Sans',
    labelFontWeight: 'bold'
  }

  public static DEFAULT_WEIGHT_STYLE: WeightStyle = {
    color: 'white',
    strokeWidth: 4,
    strokeColor: 'black',
    text: ConfService.DEFAULT_TEXT_WEIGHT_STYLE
  }

  public static SELECTED_WEIGHT_STYLE: WeightStyle = {
    color: 'white',
    strokeWidth: 5,
    strokeColor: '#006FFF',
    text: ConfService.SELECTED_TEXT_WEIGHT_STYLE
  }

  public static DEFAULT_EDGE_STYLE: EdgeStyle = {
    strokeColor: '#000000',
    strokeWidth: 8,
    arrow: ConfService.DEFAULT_ARROW_STYLE,
    weight: ConfService.DEFAULT_WEIGHT_STYLE
  };

  public static SELECTED_EDGE_STYLE: EdgeStyle = {
    strokeColor: '#006FFF',
    strokeWidth: 10,
    arrow: ConfService.SELECTED_ARROW_STYLE,
    weight: ConfService.SELECTED_WEIGHT_STYLE
  };

  // App properties
  public static ALWAYS_HIDE_HELPER_TEXT: boolean = false;

  // Force properties
  public static DEFAULT_FORCE_MODE_ON: boolean = true; // Enable force mode by default on start
  public static DEFAULT_CENTER_FORCE_ON: boolean = true;
  public static DEFAULT_LINK_FORCE_ON: boolean = true;
  public static REPULSIVE_CONSTANT: number = 15000;
  public static SPRING_FORCE_CONSTANT: number = 1;
  public static LINK_FORCE_CONSTANT: number = 0.04;

  // Canvas properties
  public static SHOW_GRID: boolean = false;
  public static BOUNDS_X_MIN: number = -1000;
  public static BOUNDS_X_MAX: number = 3000;
  public static BOUNDS_Y_MIN: number = -1000;
  public static BOUNDS_Y_MAX: number = 2000;
  public static BOUNDS_GAP: number = 200;

  // Graph properties
  public static DEFAULT_GRAPH_ORIENTATION = GraphOrientation.ORIENTED;

  // Node properties
  public static DEFAULT_RADIUS = 30;
  public static MIN_NODE_RADIUS = 15;
  public static MAX_NODE_RADIUS = 60;
  // Node stroke
  public static MIN_NODE_STROKE_WIDTH = 1;
  public static MAX_NODE_STROKE_WIDTH = 10;
  // Node label
  public static MIN_NODE_LABEL_FONT_SIZE = 12;
  public static MAX_NODE_LABEL_FONT_SIZE = 36;

  // Edge properties
  public static MIN_EDGE_STROKE_WIDTH = 3;
  public static MAX_EDGE_STROKE_WIDTH = 18;
  public static MIN_ARROW_SIZE = 15;
  public static MAX_ARROW_SIZE = 40;
  public static MIN_WEIGHT_SIZE = 10;
  public static MAX_WEIGHT_SIZE = 40;
  public static EDGE_HIT_AREA_PADDING: number = 15;
  // Default value for showing weight of edge
  public static SHOW_WEIGHT: boolean = true; // Default value sets via event handling
  public static MAX_WEIGHT: number = 1000;
  public static MIN_WEIGHT: number = 1;

  constructor() {
  }
}
