import {AlgorithmAnimationResolver} from "./algorithm-animation-resolver";
import {PixiService} from "../../../service/pixi.service";
import {ShortPathResult} from "../algorithm-resolver";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {EdgeIndex} from "../../../model/edge";
import {AlgorithmCalculationResponse} from "../../../service/manager/algorithm-manager.service";
import {NodeView} from "../../../model/graphical-model/node/node-view";
import {AnimatedEdgeView} from "../../../model/graphical-model/edge/animated-edge-view";
import {StateService} from "../../../service/event/state.service";
import {ConfService} from "../../../service/config/conf.service";
import {AnimatedNodeView} from "../../../model/graphical-model/node/animated-node-view";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";
import {NodeStyle, WeightStyle} from "../../../model/graphical-model/graph/graph-view-properties";
import {GraphicalUtils} from "../../../utils/graphical-utils";
import {Texture} from "pixi.js";

/**
 * Short path animation resolver class.
 */
export class DijkstraAnimationResolver implements AlgorithmAnimationResolver {

  private shortestPathResult: ShortPathResult; // Incoming data from the algorithm resolver
  private readonly finalNode: number; // End node index
  public readonly totalSteps: number; // Total steps of the algorithm
  private currentStep: number = 0; // Current step of the algorithm
  private currentSpeed: number = 1; // Current speed of the animation

  // Affected edges by the algorithm
  // It is list which contains all steps of the algorithm
  private allSteps: CheckedPath[] = [];
  // Shortest path
  private path: Map<number, EdgeView> = new Map<number, EdgeView>(); // Key is start node index for animation, value is edge view

  // Animation
  private paused: boolean = false; // Indicate if user paused the animation
  private isAnimationRun: boolean = false;

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private graphService: GraphViewService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private data: AlgorithmCalculationResponse) {
    this.shortestPathResult = data.result as ShortPathResult;
    this.totalSteps = this.shortestPathResult.checkedPaths.length;
    this.finalNode = this.shortestPathResult.endNode;
    // Fill the path map (shortest path)
    for (let i = 1; i < this.shortestPathResult.path.length; i++) {
      const previousNodeIndex = this.shortestPathResult.path[i - 1];
      const nodeIndex = this.shortestPathResult.path[i];
      const edgeView = this.getEdgeViewFromNodes(previousNodeIndex, nodeIndex);
      this.path.set(previousNodeIndex, edgeView);
    }
    // Fill the checked path
    this.initAlgorithmSteps();
  }

  private initAlgorithmSteps() {
    const nodesIndexes: Map<number, MultiVisitedAnimatedNode> = new Map<number, MultiVisitedAnimatedNode>(); // To init AnimatedNode for each node only once
    for (let step = 0; step < this.shortestPathResult.checkedPaths.length; step++) {
      const checkedPath = this.shortestPathResult.checkedPaths[step];
      const edgeView = this.getEdgeViewFromNodes(checkedPath.currentNode, checkedPath.neighborNode);
      const startNode = this.graphService.nodeViews.get(checkedPath.currentNode)!;
      const startNodePosition = edgeView.startNode === startNode ? 1 : 2;
      const edgeColor = [...this.path.values()].some(value => value === edgeView) ?
        ConfService.ALGORITHM_PATH_COLOR : ConfService.ALGORITHM_SELECTION_COLOR;
      const secondNode = this.getSecondNode(startNode, edgeView);
      const nodeColor = this.path.has(secondNode.node.index) ? ConfService.ALGORITHM_PATH_COLOR :
        ConfService.ALGORITHM_SELECTION_COLOR;
      const isFinal = secondNode.node.index === this.finalNode;

      let secondAnimatedNode: MultiVisitedAnimatedNode;
      if (nodesIndexes.has(secondNode.node.index)) {
        //console.log(`Node ${secondNode.node.index} already exists. Step: ${step}`);
        secondAnimatedNode = nodesIndexes.get(secondNode.node.index)!;
        secondAnimatedNode.addStepDistance(step, checkedPath.distance, secondAnimatedNode.getLastStepDistance());
      } else {
        const animatedNode = new AnimatedNodeView(secondNode, 'Inf', null,
          nodeColor, isFinal);
        secondAnimatedNode = new MultiVisitedAnimatedNode(animatedNode, step, checkedPath.distance); // step is the algorithm step
        nodesIndexes.set(secondNode.node.index, secondAnimatedNode);
      }
      const animatedEdge = new AnimatedEdgeView(edgeView, startNodePosition, edgeColor);
      this.allSteps.push({
        index: edgeView.getIndex(),
        path: {firstNode: startNode, secondNode: secondAnimatedNode, edge: animatedEdge}
      });
    }
  }

  /**
   * Prepare the view for the animation.
   * Set graph nodes and edges to the initial state before the algorithm started.
   */
  public prepareView(): void {
    const nodesIndexes: number[] = [];
    this.allSteps.forEach(checkedPath => {
      // Nodes
      const node: MultiVisitedAnimatedNode = checkedPath.path.secondNode;
      this.prepareAnimatedNodeView(node, nodesIndexes);
      // Edges
      const edge = checkedPath.path.edge;
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
    });
  }

  /**
   * Play the animation.
   */
  public async play() {
    this.paused = false;
    for (let i = this.currentStep; i < this.allSteps.length; i++) {
      if (this.paused) break; // Exit if paused
      await this.performStepForward();
      await delay(200/this.currentSpeed); // Add delay between steps
    }
  }

  /**
   * Pause the animation.
   */
  public pause() {
    this.paused = true;
  }

  /**
   * Step forward in the animation.
   */
  public async stepForward(): Promise<void> {
    this.paused = false;
    await this.performStepForward();
  }

  /**
   * Step backward in the animation.
   */
  public async stepBackward(): Promise<void> {
    this.paused = false;
    await this.performStepBackward();
  }

  /**
   * Go to the specific step.
   * No animation will be performed, just set the view to the specific state.
   */
  public goToStep(step: number) {
    // If moving forward, update only the elements from the current step to the new step
    if (step > this.currentStep) {
      for (let i = this.currentStep; i < step; i++) {
        const edge: AnimatedEdgeView = this.allSteps[i].path.edge;
        const node: MultiVisitedAnimatedNode = this.allSteps[i].path.secondNode;
        edge.finalState();
        node.setFinalStateByStep(i);
      }
      this.stateService.canAlgorithmStepBackward(true);
    } else if (step < this.currentStep) {
      for (let i = this.currentStep - 1; i >= step; i--) {
        const edge: AnimatedEdgeView = this.allSteps[i].path.edge;
        const node: MultiVisitedAnimatedNode = this.allSteps[i].path.secondNode;
        // Reset edge and node to initial state
        edge.initialState();
        node.setInitialStateByStep(i);
      }
      this.stateService.canAlgorithmStepForward(true);
      if (step === 0) {
        this.stateService.canAlgorithmStepBackward(false);
      }
    }
    // Update the current step
    this.currentStep = step;
  }

  /**
   * Reset the animation.
   * Set all node and edge views to their initial state (before algorithm mode started).
   */
  public async reset(): Promise<void> {
    this.pause();
    while (this.isAnimationRun) {
      await delay(100); // Wait for the current animation to finish
    }
    this.currentStep = 0;
    this.allSteps.forEach(checkedPath => {
      const edge = checkedPath.path.edge;
      const node = checkedPath.path.secondNode;
      node.resetToDefault();
      edge.resetEdge();
    });
    this.stateService.changeAlgorithmCurrentStep(this.currentStep);
  }

  /**
   * Change the speed of the animation.
   */
  public async changeSpeed(speed: number) {
    this.currentSpeed = speed;
    while (this.isAnimationRun) {
      await delay(100); // Wait for the current animation to finish
    }
    this.allSteps.forEach(checkedPath => {
      checkedPath.path.edge.speed = speed;
      checkedPath.path.secondNode.animatedNode.speed = speed;
    });
  }

  private prepareAnimatedNodeView(node: MultiVisitedAnimatedNode, nodesIndexes: number[]) {
    const nodeStyle: NodeStyle = Object.assign({}, node.animatedNode.nodeView.nodeStyle);
    const stringColor = GraphicalUtils.hexNumberToString(node.animatedNode.color);
    nodeStyle.fillNode = stringColor;
    // Create textures for each step only once. Reuse the same texture for all steps except the first one.
    const oldTexture = node.animatedNode.nodeView.texture;
    const newTexture = this.nodeFabric.createTexture(nodeStyle);
    let counter = 0;
    node.stepDistance.forEach((value, key) => {
      if (counter === 0) {
        node.addGraphicsInfo(key, oldTexture, newTexture);
      } else {
        // Set the same texture for all steps except the first one.
        // The first step is the initial state of the node. Other should have same texture for initial state of animation.
        node.addGraphicsInfo(key, newTexture, newTexture);
      }
      counter++;
    });
    if (!nodesIndexes.includes(node.animatedNode.nodeView.node.index)) { // To init node graphics only once
      nodesIndexes.push(node.animatedNode.nodeView.node.index);
      node.animatedNode.initTexturesAndGraphics(oldTexture, newTexture);
    }
  }

  private async performStepForward(): Promise<void> {
    if (this.currentStep === this.allSteps.length) {
      return; // Last step
    }
    const edge: AnimatedEdgeView = this.allSteps[this.currentStep].path.edge;
    const node: MultiVisitedAnimatedNode = this.allSteps[this.currentStep].path.secondNode;
    if (edge.isAnimationInProgress() || node.animatedNode.isAnimationInProgress()) {
      this.isAnimationRun = false;
      return; // Skip if animation is in progress
    }
    this.isAnimationRun = true;
    await this.animateEdgePath(edge);
    await this.animateNode(node);
    if (!this.paused) { // Increment step only if not paused
      this.currentStep++;
      this.stateService.changeAlgorithmCurrentStep(this.currentStep);
    } else { // Reset the animation if paused
      edge.initialState();
      node.setInitialStateByStep(this.currentStep);
      this.stateService.canAlgorithmStepForward(true);
      this.stateService.canAlgorithmPlay(true);
    }
    this.isAnimationRun = false;
  }

  private async performStepBackward(): Promise<void> {
    if (this.currentStep === 0) {
      return; // First step
    }
    this.currentStep--;
    const edge: AnimatedEdgeView = this.allSteps[this.currentStep].path.edge;
    const node: MultiVisitedAnimatedNode = this.allSteps[this.currentStep].path.secondNode;
    if (edge.isAnimationInProgress() || node.animatedNode.isAnimationInProgress()) {
      this.isAnimationRun = false;
      return; // Skip if animation is in progress
    }
    this.isAnimationRun = true;
    await this.reverseNodeAnimation(node);
    await this.reverseEdgePath(edge);
    this.stateService.changeAlgorithmCurrentStep(this.currentStep);
    this.isAnimationRun = false;
  }

  private getEdgeViewFromNodes(from: number, to: number): EdgeView {
    let edge = this.graphService.edgeViews.get(new EdgeIndex(from, to).value);
    if (!edge) {
      edge = this.graphService.edgeViews.get(new EdgeIndex(to, from).value)!;
    }
    return edge;
  }

  private async animateEdgePath(edge: AnimatedEdgeView): Promise<void> {
    await edge.startAnimation();
  }

  private async animateNode(node: MultiVisitedAnimatedNode): Promise<void> {
    node.setInitialStateByStep(this.currentStep);
    await node.animatedNode.startAnimation();
  }

  private getSecondNode(startNode: NodeView, edge: EdgeView): NodeView {
    return edge.startNode === startNode ? edge.endNode : edge.startNode;
  }

  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  private async reverseEdgePath(edge: AnimatedEdgeView): Promise<void> {
    await edge.reverseAnimation();
  }

  private async reverseNodeAnimation(node: MultiVisitedAnimatedNode): Promise<void> {
    node.setFinalStateByStep(this.currentStep);
    await node.animatedNode.reverseAnimation();
  }
}

/**
 * Reconstruction of algorithm steps.
 */
export interface CheckedPath {
  index: string; // Edge index
  path: Path;
}

export interface Path {
  firstNode: NodeView;
  secondNode: MultiVisitedAnimatedNode; // Animate only the end node
  edge: AnimatedEdgeView;
}

/**
 * Delay function to introduce a pause between steps.
 * @param ms - The duration in milliseconds to wait.
 * @returns {Promise<void>}
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Multi visited node class.
 * Since one node can be visited multiple times during the algorithm,
 * we need to store the label of the node for each step
 */
export class MultiVisitedAnimatedNode {

  // Store label of node for each algorithm step
  private _stepDistance: Map<number, MultiDistanceInfo> = new Map<number, MultiDistanceInfo>(); // key is algorithm step, value is
  // Store textures for each algorithm step
  private stepGraphicsInfo: Map<number, GraphicsInfo> = new Map<number, GraphicsInfo>(); // key is algorithm step, value is graphics info
  constructor(public readonly animatedNode: AnimatedNodeView,
              public readonly stepOfFirstOccurrence: number,
              distance: number) {
    this._stepDistance.set(stepOfFirstOccurrence, {distance, previousDistance: Infinity}); // Set the first occurrence
  }

  public addStepDistance(step: number, distance: number, previousDistance: number) {
    this._stepDistance.set(step, {distance, previousDistance});
  }

  public getStepDistance(step: number): MultiDistanceInfo {
    return this._stepDistance.get(step)!;
  }

  /**
   * Get the minimum label before the given step.
   * Including the given step.
   */
  public getMinimumDistanceBeforeStep(step: number): MultiDistanceInfo {
    let min: MultiDistanceInfo = {distance: Infinity, previousDistance: Infinity};
    this._stepDistance.forEach((value, key) => {
      if (key <= step && value.distance < min.distance) {
        min = value;
      }
    });
    return min;
  }

  /**
   * Get the last step label.
   */
  getLastStepDistance() {
    if (this._stepDistance.size === 0) {
      return Infinity; // No steps
    }
    const result = [...this._stepDistance.values()].pop()!.distance;
    return result;
  }

  /**
   * Set the initial graphics state of the node by the given step.
   */
  public addGraphicsInfo(step: number, beforeTexture: Texture, afterTexture: Texture) {
    this.stepGraphicsInfo.set(step, {beforeTexture, afterTexture});
  }

  /**
   * Get the graphics info by the given step.
   */
  public getGraphicsInfo(step: number): GraphicsInfo {
    return this.stepGraphicsInfo.get(step)!;
  }

  /**
   * Set the initial state of the node by the given step.
   */
  setInitialStateByStep(currentStep: number) {
    this.animatedNode.resetNode(); // Reset the node to the initial state if it is not the first step
    const minimumDistance = this.getMinimumDistanceBeforeStep(currentStep); // Get the minimum label before the given step
    this.animatedNode.algInitLabel = this.distanceToString(this.getStepDistance(currentStep).previousDistance);
    this.animatedNode.algFinalLabel = this.distanceToString(minimumDistance.distance);
    const graphicsInfo = this.getGraphicsInfo(currentStep);
    this.animatedNode.initTexturesAndGraphics(graphicsInfo.beforeTexture, graphicsInfo.afterTexture)
  }

  /**
   * Set the final state of the node by the given step.
   */
  setFinalStateByStep(currentStep: number) {
    const graphicsInfo = this.getGraphicsInfo(currentStep);
    this.animatedNode.beforeAnimationTexture = graphicsInfo.beforeTexture;
    this.animatedNode.afterAnimationTexture = graphicsInfo.afterTexture;
    const minimumDistance = this.getMinimumDistanceBeforeStep(currentStep); // Get the minimum label before the given step
    this.animatedNode.algInitLabel = this.distanceToString(this.getStepDistance(currentStep).previousDistance);
    this.animatedNode.algFinalLabel = this.distanceToString(minimumDistance.distance);
    this.animatedNode.finalState();
  }

  /**
   * Reset the node to the state before animation mode active.
   * After calling this method, this object shouldn't be used anymore
   */
  resetToDefault() {
    const graphicsInfo = this.getGraphicsInfo(this.stepOfFirstOccurrence);
    this.animatedNode.beforeAnimationTexture = graphicsInfo.beforeTexture;
    this.animatedNode.resetNode();
  }

  /**
   * Key is algorithm step, value is label of the node.
   */
  get stepDistance(): Map<number, MultiDistanceInfo> {
    return this._stepDistance;
  }

  private distanceToString(value: number) {
    return value === Infinity ? 'Inf' : value.toString();
  }
}

interface GraphicsInfo {
  beforeTexture: Texture;
  afterTexture: Texture;
}

interface MultiDistanceInfo {
  distance: number;
  previousDistance: number;
}
