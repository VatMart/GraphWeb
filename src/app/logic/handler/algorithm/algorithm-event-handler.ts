import {InitializationError} from "../../../error/initialization-error";
import {PixiService} from "../../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../../service/event/event-bus.service";
import {StateService} from "../../../service/event/state.service";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";
import {FederatedPointerEvent} from "pixi.js";
import {EventUtils} from "../../../utils/event-utils";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {NodeStyle} from "../../../model/graphical-model/graph/graph-view-properties";
import {ConfService} from "../../../service/config/conf.service";
import {AlgorithmType} from "../../../model/Algorithm";
import {Text} from "pixi.js";

/**
 * Handles all events related to algorithms.
 */
export class AlgorithmEventHandler {
  private static instance: AlgorithmEventHandler | undefined = undefined;

  /**
   * Returns the instance of the NodeEventHandler.
   * Before calling this method, the NodeEventHandler must be initialized.
   * Throws InitializationError if the instance is not initialized.
   */
  public static getInstance(): AlgorithmEventHandler {
    if (this.instance === undefined) {
      throw new InitializationError("AlgorithmEventHandler is not initialized. Call initialize() first.");
    }
    return this.instance;
  }

  private onShortestPathBound: (event: FederatedPointerEvent) => void;

  // Shortest path selection
  public static startNodeStyle: NodeStyle = ConfService.START_NODE_STYLE;
  public static endNodeStyle: NodeStyle = ConfService.END_NODE_STYLE;
  private static startNode: NodeView | undefined;
  private static endNode: NodeView | undefined;
  private startText: Text = new Text();
  private endText: Text = new Text();

  private constructor(private pixiService: PixiService,
                      private eventBus: EventBusService,
                      private stateService: StateService,
                      private graphViewService: GraphViewService,
                      private nodeFabric: NodeViewFabricService,
                      private edgeFabric: EdgeViewFabricService) {
    this.onShortestPathBound = this.shortestPathSelect.bind(this);
    // Register event handlers
    this.eventBus.registerHandler(HandlerNames.SHORTEST_PATH_SELECTION, this.onShortestPathBound);
    // Set up texts style
    this.startText.style.fill = '#ff8c18';
    this.startText.style.fontSize = 36;
    this.startText.style.fontFamily = 'Nunito Sans';
    this.startText.style.fontWeight = 'bold';
    this.startText.style.stroke = { color: 'black', width: 3, join: 'round' };
    this.startText.anchor.set(0.5);
    this.endText.style.fill = '#e25d5d';
    this.endText.style.fontSize = 32;
    this.endText.style.fontFamily = 'Nunito Sans';
    this.endText.style.fontWeight = 'bold';
    this.endText.style.stroke = { color: 'black', width: 3, join: 'round' };
    this.endText.anchor.set(0.5);
  }

  /**
   * Initializes the NodeEventHandler.
   */
  public static initialize(pixiService: PixiService,
                           eventBus: EventBusService,
                           stateService: StateService,
                           graphViewService: GraphViewService,
                           nodeFabric: NodeViewFabricService,
                           edgeFabric: EdgeViewFabricService): AlgorithmEventHandler {
    this.instance = new AlgorithmEventHandler(pixiService, eventBus, stateService, graphViewService,
      nodeFabric, edgeFabric);
    return this.instance;
  }

  private shortestPathSelect(event: FederatedPointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (AlgorithmEventHandler.startNode && AlgorithmEventHandler.endNode) { // Both nodes already selected
      return;
    }
    if (EventUtils.isNodeView(event.target)) {
      let nodeView: NodeView = event.target as NodeView;
      if (!AlgorithmEventHandler.startNode) {
        AlgorithmEventHandler.startNode = nodeView;
        this.stateService.changeCanResetAlgorithm(true);
        this.switchNodeStyle(nodeView, true, 'start', 'Start');
      } else if (!AlgorithmEventHandler.endNode) {
        if (AlgorithmEventHandler.startNode === nodeView) {
          return; // Cannot select the same node as start and end
        }
        AlgorithmEventHandler.endNode = nodeView;
        this.switchNodeStyle(nodeView, true, 'end', 'End');
        if (this.stateService.getActiveAlgorithm()) {
          this.stateService.requestShortestPath({
            algorithm: this.stateService.getActiveAlgorithm()!,
            algorithmType: AlgorithmType.SHORTEST_PATH,
            startNodeIndex: AlgorithmEventHandler.startNode.node!.index,
            endNodeIndex: AlgorithmEventHandler.endNode.node!.index
          });
        }
      }
    }
  }

  public switchNodeStyle(nodeView: NodeView | undefined, enable: boolean, nodeType: 'start' | 'end',
                         text?: string): void {
    if (enable && nodeView) {
      AlgorithmEventHandler.startNodeStyle.radius = nodeView.nodeStyle.radius;
      AlgorithmEventHandler.startNodeStyle.strokeWidth = nodeView.nodeStyle.strokeWidth + 1;
      this.nodeFabric.changeToStyle(nodeView, nodeType === 'start' ? AlgorithmEventHandler.startNodeStyle
        : AlgorithmEventHandler.endNodeStyle, ConfService.CHOOSE_STROKE_GRADIENT);
      if (text) {
        this.attachTextToNodeView(nodeView, nodeType, text);
      }
    } else if (nodeView) {
      this.nodeFabric.changeToStyle(nodeView, nodeView.nodeStyle);
      nodeView.removeChild(nodeType === 'start' ? this.startText : this.endText);
    }
  }

  public clearSelectedNodes(): void {
    this.switchNodeStyle(AlgorithmEventHandler.startNode, false, 'start');
    this.switchNodeStyle(AlgorithmEventHandler.endNode, false, 'end');
    AlgorithmEventHandler.startNode = undefined;
    AlgorithmEventHandler.endNode = undefined;
    this.stateService.changeCanResetAlgorithm(false);
  }

  private attachTextToNodeView(nodeView: NodeView, nodeType: 'start' | 'end', value: string) {
    const width = nodeView.width;
    const textPoint = {x: width/2, y: -20};
    const text: Text = nodeType === 'start' ? this.startText : this.endText
    text.x = textPoint.x;
    text.y = textPoint.y;
    text.text = value;
    nodeView.addChild(text);
  }
}
