import {Injectable} from '@angular/core';
import {GraphOrientation} from "../../model/orientation";
import {
  EdgeStyle,
  GraphViewProperties,
  GraphViewStyle,
  NodeStyle
} from "../../model/graphical-model/graph/graph-view-properties";
import {selectedStyle} from "../../model/graphical-model/graph/style-template/selected-style";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {GradientColor} from "../fabric/node-view-fabric.service";
import {BLACK_WHITE_SMALL_STYLE} from "../../model/graphical-model/graph/style-template/black-white-small-style";
import {Algorithm} from "../../model/Algorithm";

/**
 * Service for managing the configuration of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfService {

  // Styles
  public static CURRENT_GRAPH_STYLE: GraphViewStyle = BLACK_WHITE_SMALL_STYLE();
  public static DEFAULT_GRAPH_STYLE: GraphViewStyle = BLACK_WHITE_SMALL_STYLE(); // Default style uses when user resets style to default
  public static SELECTED_GRAPH_STYLE(node?: NodeView, edge?: EdgeView): GraphViewStyle {
    return selectedStyle(node, edge);
  }

  /**
   * Style for the start node when adding an edge.
   */
  public static START_NODE_STYLE: NodeStyle = {
    radius: ConfService.CURRENT_GRAPH_STYLE.nodeStyle.radius,
    fillNode: '#FFC618',
    strokeColor: ConfService.CURRENT_GRAPH_STYLE.nodeStyle.strokeColor,
    strokeWidth: Math.max(ConfService.CURRENT_GRAPH_STYLE.nodeStyle.strokeWidth + 2, 4),
    labelStyle: ConfService.CURRENT_GRAPH_STYLE.nodeStyle.labelStyle
  };

  /**
   * Style for the end node when using algorithms.
   */
  public static END_NODE_STYLE: NodeStyle = {
    radius: ConfService.CURRENT_GRAPH_STYLE.nodeStyle.radius,
    fillNode: '#ff5f5f',
    strokeColor: ConfService.CURRENT_GRAPH_STYLE.nodeStyle.strokeColor,
    strokeWidth: Math.max(ConfService.CURRENT_GRAPH_STYLE.nodeStyle.strokeWidth + 2, 4),
    labelStyle: ConfService.CURRENT_GRAPH_STYLE.nodeStyle.labelStyle
  };

  /**
   * Gradient color for the chosen node. Used when adding an edge or in algorithms.
   * Gradient used for better visibility. In case if user customized graph elements.
   */
  public static CHOOSE_STROKE_GRADIENT: GradientColor = {startColor: '#FFC618', endColor: '#FF0000'};

  // Properties of application
  // App properties
  public static ALWAYS_HIDE_HELPER_TEXT: boolean = false;

  // Force properties
  public static FORCE_GRID_SIZE: number = 150; // Grid size for force mode
  public static DEFAULT_FORCE_MODE_ON: boolean = true; // Enable force mode by default on start
  public static DEFAULT_CENTER_FORCE_ON: boolean = true;
  public static DEFAULT_LINK_FORCE_ON: boolean = true;
  public static REPULSIVE_CONSTANT: number = 15000;
  public static SPRING_FORCE_CONSTANT: number = 1;
  public static LINK_FORCE_CONSTANT: number = 0.04;
  public static MAX_DISTANCE_FORCE: number = 160; // Max distance for applying force

  // Canvas properties
  public static SHOW_GRID: boolean = true;
  public static BOUNDS_X_MIN: number = -1000;
  public static BOUNDS_X_MAX: number = 3000;
  public static BOUNDS_Y_MIN: number = -1000;
  public static BOUNDS_Y_MAX: number = 2000;
  public static BOUNDS_GAP: number = 200;

  // Graph properties
  public static MAX_NUMBER_OF_NODES: number = 350; // Max number of nodes in the graph
  public static DEFAULT_GRAPH_ORIENTATION = GraphOrientation.ORIENTED;

  // Node properties
  public static DYNAMIC_NODE_SIZE: boolean = true; // Dynamic size changes according to number of adjacent edges
  public static SHOW_NODE_LABEL: boolean = true;
  public static MIN_NODE_RADIUS = 15;
  public static MAX_NODE_RADIUS = 60;
  // Node stroke
  public static MIN_NODE_STROKE_WIDTH = 0;
  public static MAX_NODE_STROKE_WIDTH = 10;
  // Node label
  public static MAX_NODE_LABEL_LENGTH = 20; // 20 symbols
  public static MIN_NODE_LABEL_FONT_SIZE = 12;
  public static MAX_NODE_LABEL_FONT_SIZE = 36;

  // Edge properties
  public static MIN_EDGE_STROKE_WIDTH = 3;
  public static MAX_EDGE_STROKE_WIDTH = 18;
  public static MIN_ARROW_SIZE = 15;
  public static MAX_ARROW_SIZE = 40;
  public static MIN_WEIGHT_SIZE = 15;
  public static MAX_WEIGHT_SIZE = 30;
  public static EDGE_HIT_AREA_PADDING: number = 15;
  // Default value for showing weight of edge
  public static SHOW_WEIGHT: boolean = true; // Default value sets via event handling
  public static MAX_WEIGHT: number = 1000;
  public static MIN_WEIGHT: number = 1;
  public static DYNAMIC_EDGE_WEIGHT_VALUE: boolean = false; // Dynamic value changes according to edge length

  // Algorithms related properties
  public static DEFAULT_ALGORITHM: Algorithm = Algorithm.DIJKSTRA; // Default algorithm shown in select ui component
  public static ALGORITHM_SELECTION_COLOR: number = 0xffd379; // Color of the selected element
  public static ALGORITHM_PATH_COLOR: number = 0x69d169; // Color of the path

  /**
   * Getter for current graph properties.
   */
  public static get CURRENT_GRAPH_PROPERTIES(): GraphViewProperties {
    return {
      graphStyle: ConfService.CURRENT_GRAPH_STYLE,
      nodeProperties: {
        showLabel: ConfService.SHOW_NODE_LABEL,
        dynamicNodeSize: ConfService.DYNAMIC_NODE_SIZE
      },
      edgeProperties: {
        showWeight: ConfService.SHOW_WEIGHT,
        dynamicEdgeWeightValue: ConfService.DYNAMIC_EDGE_WEIGHT_VALUE
      },
      graphOrientation: ConfService.DEFAULT_GRAPH_ORIENTATION,
      showGrid: ConfService.SHOW_GRID,
      enableForceMode: ConfService.DEFAULT_FORCE_MODE_ON,
      enableCenterForce: ConfService.DEFAULT_CENTER_FORCE_ON,
      enableLinkForce: ConfService.DEFAULT_LINK_FORCE_ON
    };
  }

  /**
   * Quick access to the current node style.
   */
  static get currentNodeStyle(): NodeStyle {
    return ConfService.CURRENT_GRAPH_STYLE.nodeStyle;
  }

  /**
   * Quick access to the current edge style.
   */
  static get currentEdgeStyle(): EdgeStyle {
    return ConfService.CURRENT_GRAPH_STYLE.edgeStyle;
  }
}
