import {GraphViewService} from "../../../service/graph/graph-view.service";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {EdgeIndex} from "../../../model/edge";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {AnimatedEdgeView} from "../../../model/graphical-model/edge/animated-edge-view";
import {NodeStyle, WeightStyle} from "../../../model/graphical-model/graph/graph-view-properties";
import {GraphicalUtils} from "../../../utils/graphical-utils";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";
import {AnimatedNodeView} from "../../../model/graphical-model/node/animated-node-view";

/**
 * Interface for the algorithm animation resolver.
 */
export abstract class AlgorithmAnimationResolver {

  totalSteps: number = 0; // Total steps of the algorithm
  protected currentStep: number = 0; // Current step of the algorithm
  protected currentSpeed: number = 1; // Current speed of the animation

  protected constructor(protected graphService: GraphViewService,
                        protected nodeFabric: NodeViewFabricService,
                        protected edgeFabric: EdgeViewFabricService) {
  }

  protected getEdgeViewFromNodes(from: number, to: number): EdgeView {
    let edge = this.graphService.edgeViews.get(new EdgeIndex(from, to).value);
    if (!edge) {
      edge = this.graphService.edgeViews.get(new EdgeIndex(to, from).value)!;
    }
    return edge;
  }

  protected getSecondNode(startNode: NodeView, edge: EdgeView): NodeView {
    return edge.startNode === startNode ? edge.endNode : edge.startNode;
  }

  protected prepareAnimatedNodeView(node: AnimatedNodeView) {
    const nodeStyle: NodeStyle = Object.assign({}, node.nodeView.nodeStyle);
    const stringColor = GraphicalUtils.hexNumberToString(node.color);
    nodeStyle.fillNode = stringColor;
    // Create textures for each step only once. Reuse the same texture for all steps except the first one.
    const oldTexture = node.nodeView.texture;
    const newTexture = this.nodeFabric.createTexture(nodeStyle);
    node.initTexturesAndGraphics(oldTexture, newTexture);
  }

  protected prepareAnimatedEdgeView(edge: AnimatedEdgeView) {
    const weightStyle: WeightStyle = Object.assign({}, edge.getEdgeView().weightView.weightStyle);
    const weightTextStyle = Object.assign({}, edge.getEdgeView().weightView.weightStyle.text);
    const stringEdgeColor = GraphicalUtils.hexNumberToString(edge.color);
    weightTextStyle.labelColor = stringEdgeColor
    weightStyle.strokeColor = stringEdgeColor;
    weightStyle.text = weightTextStyle;
    const oldWeightTexture = edge.getEdgeView().weightView.texture;
    const newWeightTexture = this.edgeFabric.createWeightTexture(edge.getEdgeView().weightView.text,
      weightStyle);
    edge.initTexturesAndGraphics(oldWeightTexture, newWeightTexture);
  }

  abstract reset(): Promise<void>;

  abstract prepareView(): void;

  abstract changeSpeed(speed: number): Promise<void>;

  abstract pause(): void;

  abstract play(): Promise<void>;

  abstract stepBackward(): Promise<void>;

  abstract stepForward(): Promise<void>;

  abstract goToStep(value: number): void;

  abstract isFirstStep(): boolean;

  abstract isLastStep(): boolean;
}

/**
 * Delay function to introduce a pause between steps.
 * @param ms - The duration in milliseconds to wait.
 * @returns {Promise<void>}
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
