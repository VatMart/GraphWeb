import {AlgorithmAnimationResolver, delay} from "./algorithm-animation-resolver";
import {PixiService} from "../../../service/pixi.service";
import {StateService} from "../../../service/event/state.service";
import {GraphViewService} from "../../../service/graph/graph-view.service";
import {NodeViewFabricService} from "../../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../../service/fabric/edge-view-fabric.service";
import {AlgorithmCalculationResponse} from "../../../service/manager/algorithm-manager.service";
import {TraverseGraphResult} from "../dfs-algorithm-calculator";
import {ConfService} from "../../../service/config/conf.service";
import {AnimatedNodeView} from "../../../model/graphical-model/node/animated-node-view";
import {AnimatedEdgeView} from "../../../model/graphical-model/edge/animated-edge-view";
import {NodeView} from "../../../model/graphical-model/node/node-view";

/**
 * Traverse graph animation resolver.
 */
export class TraverseAnimationResolver extends AlgorithmAnimationResolver {

  private traversePathResult: TraverseGraphResult; // Incoming data from the algorithm resolver

  // Traverse path
  private allSteps: TraversePath[] = [];

  // Animation
  private paused: boolean = false; // Indicate if user paused the animation
  private isAnimationRun: boolean = false; // Indicate if the animation is running

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              graphService: GraphViewService,
              nodeFabric: NodeViewFabricService,
              edgeFabric: EdgeViewFabricService,
              private data: AlgorithmCalculationResponse) {
    super(graphService, nodeFabric, edgeFabric);
    this.traversePathResult = data.result as TraverseGraphResult;
    this.totalSteps = this.traversePathResult.totalFoundNodes - 1;
    // Fill the path map (traverse path)
    for (let i = 0; i < this.traversePathResult.path.length; i++) {
      const startNodeIndex = this.traversePathResult.path[i].firstNode;
      const nodeIndex = this.traversePathResult.path[i].secondNode;
      const edgeView = this.getEdgeViewFromNodes(startNodeIndex, nodeIndex);
      console.log(`Previous node: ${startNodeIndex}, Node: ${nodeIndex}, Edge: ${edgeView.getIndex()}`);
      const startNode = this.graphService.nodeViews.get(startNodeIndex)!;
      const startNodePosition = edgeView.startNode === startNode ? 1 : 2;
      const color = ConfService.ALGORITHM_SELECTION_COLOR;
      const secondNode = this.getSecondNode(startNode, edgeView);

      const animatedNode = new AnimatedNodeView(secondNode, null, (i + 1).toString(), color);
      const animatedEdge = new AnimatedEdgeView(edgeView, startNodePosition, color);

      this.allSteps.push({
        firstNode: startNode,
        secondNode: animatedNode,
        edge: animatedEdge
      });
    }
  }

  /**
   * Prepare the view for the animation.
   * Set graph nodes and edges to the initial state before the algorithm started.
   */
  prepareView(): void {
    this.allSteps.forEach(traversePath => {
      // Nodes
      const node: AnimatedNodeView = traversePath.secondNode;
      this.prepareAnimatedNodeView(node);
      // Edges
      const edge = traversePath.edge;
      this.prepareAnimatedEdgeView(edge);
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
      await delay(200 / this.currentSpeed); // Add delay between steps
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
        const edge: AnimatedEdgeView = this.allSteps[i].edge;
        const node: AnimatedNodeView = this.allSteps[i].secondNode;
        edge.finalState();
        node.finalState();
      }
      this.stateService.canAlgorithmStepBackward(true);
    } else if (step < this.currentStep) {
      for (let i = this.currentStep - 1; i >= step; i--) {
        const edge: AnimatedEdgeView = this.allSteps[i].edge;
        const node: AnimatedNodeView = this.allSteps[i].secondNode;
        // Reset edge and node to initial state
        edge.initialState();
        node.initialState();
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
    this.allSteps.forEach(traversePath => {
      const edge = traversePath.edge;
      const node = traversePath.secondNode;
      node.resetNode();
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
    this.allSteps.forEach(traversePath => {
      traversePath.edge.speed = speed;
      traversePath.secondNode.speed = speed;
    });
  }

  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  private async performStepForward(): Promise<void> {
    if (this.currentStep === this.allSteps.length) {
      return; // Last step
    }
    const edge: AnimatedEdgeView = this.allSteps[this.currentStep].edge;
    const node: AnimatedNodeView = this.allSteps[this.currentStep].secondNode;
    if (edge.isAnimationInProgress() || node.isAnimationInProgress()) {
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
      node.initialState();
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
    const edge: AnimatedEdgeView = this.allSteps[this.currentStep].edge;
    const node: AnimatedNodeView = this.allSteps[this.currentStep].secondNode;
    if (edge.isAnimationInProgress() || node.isAnimationInProgress()) {
      this.isAnimationRun = false;
      return; // Skip if animation is in progress
    }
    this.isAnimationRun = true;
    await this.reverseNodeAnimation(node);
    await this.reverseEdgePath(edge);
    this.stateService.changeAlgorithmCurrentStep(this.currentStep);
    this.isAnimationRun = false;
  }

  private async animateEdgePath(edge: AnimatedEdgeView): Promise<void> {
    await edge.startAnimation();
  }

  private async animateNode(node: AnimatedNodeView): Promise<void> {
    await node.startAnimation();
  }

  private async reverseEdgePath(edge: AnimatedEdgeView): Promise<void> {
    await edge.reverseAnimation();
  }

  private async reverseNodeAnimation(node: AnimatedNodeView): Promise<void> {
    await node.reverseAnimation();
  }

}

export interface TraversePath {
  firstNode: NodeView;
  secondNode: AnimatedNodeView; // Animate only the end node
  edge: AnimatedEdgeView;
}
