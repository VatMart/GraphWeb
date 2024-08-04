import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {AlgorithmCalculationResponse} from "../../service/manager/algorithm-manager.service";
import {StateService} from "../../service/event/state.service";
import {AlgorithmAnimationResolver} from "../algorithm/animation/algorithm-animation-resolver";
import {AlgorithmEventHandler} from "../handler/algorithm/algorithm-event-handler";

/**
 * Interface for modes.
 * Mode is a state of the application, which defines the behavior of the application.
 * Mode can have submodes.
 */
export interface Mode extends ModeBehavior {
  readonly modeState: ModeState;
  submode: Submode | undefined; // Submode is optional

  /**
   * Register submode.
   */
  registerSubmode(submode: Submode): void;

  /**
   * Unregister submode. Submode should be turned off when unregistered.
   */
  unregisterSubmode(): void;

  /**
   * Get current submode state.
   */
  getSubmodeState(): SubmodeState;

  /**
   * Turn submode on.
   */
  submodeOn(): void;

  /**
   * Turn submode off.
   */
  submodeOff(): void;
}

/**
 * Base mode class. Implements common mode behavior.
 */
export abstract class BaseMode implements Mode {
  readonly modeState!: ModeState;
  submode: Submode | undefined;

  getSubmodeState(): SubmodeState {
    if (this.submode) {
      return this.submode.submodeState;
    }
    return 'none';
  }

  registerSubmode(submode: Submode): void {
    if (this.submode) {
      this.submodeOff();
    }
    this.submode = submode;
  }

  unregisterSubmode(): void {
    if (this.submode) {
      this.submodeOff();
      this.submode = undefined;
    }
  }

  submodeOff(): void {
    if (this.submode && this.submode.isActive()) {
      this.submode.modeOff();
    }
  }

  submodeOn(): void {
    if (this.submode) {
      this.submode.modeOn();
    }
  }

  abstract modeOff(): void;

  abstract modeOn(): void;

  abstract onAddedEdge(edgeView: EdgeView): void;

  abstract onAddedNode(nodeView: NodeView): void;

  abstract onBeforeNodeDeleted(nodeView: NodeView): void;

  abstract onGraphCleared(): void;

  abstract onGraphViewGenerated(): void;

  abstract onRedoInvoked(): void;

  abstract onRemovedEdge(edgeView: EdgeView): void;

  abstract onRemovedNode(nodeView: NodeView): void;

  abstract onUndoInvoked(): void;
}

/**
 * Interface for submodes.
 * Submodes are part of the mode. They define the behavior of the application in the context of the mode.
 */
export interface Submode extends ModeBehavior {
  readonly submodeState: SubmodeState;

  /**
   * Check if submode is active.
   */
  isActive(): boolean;
}

/**
 * Interface for algorithm submodes.
 */
export interface AlgorithmSubmode extends Submode {

  /**
   * Reset algorithm.
   * Change the state of the algorithm to the initial state.
   */
  resetAlgorithm(): Promise<void>;

  /**
   * Resolve algorithm animation.
   * This method is called when the algorithm calculation is finished.
   */
  resolveAlgorithmAnimation(data: AlgorithmCalculationResponse): void;

  /**
   * Step forward in the animation.
   */
  stepForward(): void;

  /**
   * Step backward in the animation.
   */
  stepBackward(): void;

  /**
   * Go to the specific step in the animation.
   */
  goToStep(value: number): void;

  /**
   * Play the animation.
   */
  play(): void;

  /**
   * Pause the animation.
   */
  pause(): void;

  /**
   * Change the speed of the animation.
   */
  changeSpeed(speed: number): void;
}

/**
 * Base algorithm submode class. Implements common algorithm submode behavior.
 */
export abstract class BaseAlgorithmSubmode implements AlgorithmSubmode {
  abstract submodeState: SubmodeState;

  protected animationResolver: AlgorithmAnimationResolver | undefined;
  protected active: boolean = false;

  protected constructor(protected stateService: StateService) {
  }

  async resetAlgorithm(): Promise<void> {
    if (this.active) {
      AlgorithmEventHandler.getInstance().clearSelectedNodes();
      if (this.animationResolver) {
        await this.animationResolver.reset();
        this.stateService.algorithmPlaying(false);
        this.stateService.canAlgorithmStepBackward(false);
        this.stateService.canAlgorithmStepForward(true);
        this.stateService.canAlgorithmPlay(true);
      }
    }
  }

  abstract resolveAlgorithmAnimation(data: AlgorithmCalculationResponse): void;

  async stepForward(): Promise<void> {
    if (this.animationResolver) {
      this.stateService.canAlgorithmPlay(false);
      this.stateService.canAlgorithmStepBackward(false);
      this.stateService.canAlgorithmStepForward(false);
      this.stateService.canAlgorithmGoToStep(false);
      this.stateService.canAlgorithmChangeSpeed(false);
      await this.animationResolver.stepForward();
      this.stateService.canAlgorithmPlay(true);
      this.stateService.canAlgorithmStepForward(true);
      this.stateService.canAlgorithmStepBackward(true);
      this.stateService.canAlgorithmGoToStep(true);
      this.stateService.canAlgorithmChangeSpeed(true);
      if (this.animationResolver.isLastStep()) {
        this.stateService.canAlgorithmPlay(false);
        this.stateService.canAlgorithmStepForward(false);
      }
    }
  }

  async stepBackward(): Promise<void> {
    if (this.animationResolver) {
      this.stateService.canAlgorithmPlay(false);
      this.stateService.canAlgorithmStepBackward(false);
      this.stateService.canAlgorithmStepForward(false);
      this.stateService.canAlgorithmGoToStep(false);
      this.stateService.canAlgorithmChangeSpeed(false);
      await this.animationResolver.stepBackward();
      if (this.animationResolver.isFirstStep()) {
        this.stateService.canAlgorithmStepBackward(false);
      } else {
        this.stateService.canAlgorithmStepBackward(true);
      }
      this.stateService.canAlgorithmChangeSpeed(true);
      this.stateService.canAlgorithmGoToStep(true);
      this.stateService.canAlgorithmPlay(true);
      this.stateService.canAlgorithmStepForward(true);
    }
  }

  goToStep(value: number) {
    if (this.animationResolver) {
      this.animationResolver.goToStep(value);
      if (this.animationResolver.isLastStep()) {
        this.stateService.canAlgorithmPlay(false);
        this.stateService.canAlgorithmStepForward(false);
      } else {
        this.stateService.canAlgorithmPlay(true);
      }
    }
  }

  async play(): Promise<void> {
    if (this.animationResolver) {
      this.stateService.algorithmPlaying(true);
      this.stateService.canAlgorithmStepBackward(false);
      this.stateService.canAlgorithmStepForward(false);
      this.stateService.canAlgorithmGoToStep(false);
      this.stateService.canAlgorithmChangeSpeed(false);
      await this.animationResolver.play();
      this.stateService.canAlgorithmChangeSpeed(true);
      this.stateService.canAlgorithmGoToStep(true);
      this.stateService.algorithmPlaying(false);
      this.stateService.canAlgorithmStepForward(true);
      if (this.animationResolver.isFirstStep()) {
        this.stateService.canAlgorithmStepBackward(false);
      } else {
        this.stateService.canAlgorithmStepBackward(true);
      }
      if (this.animationResolver.isLastStep()) {
        this.stateService.canAlgorithmPlay(false);
        this.stateService.canAlgorithmStepForward(false);
      }
    }
  }

  async pause(): Promise<void> {
    if (this.animationResolver) {
      if (this.animationResolver.isFirstStep()) {
        this.stateService.canAlgorithmStepBackward(false);
      }
      this.stateService.algorithmPlaying(false);
      this.animationResolver.pause();
    }
  }

  async changeSpeed(speed: number): Promise<void> {
    if (this.animationResolver) {
      await this.animationResolver.changeSpeed(speed);
    }
  }

  isActive(): boolean {
    return this.active;
  }

  abstract modeOn(): void;

  abstract modeOff(): void;

  abstract onAddedNode(nodeView: NodeView): void;

  abstract onBeforeNodeDeleted(nodeView: NodeView): void;

  abstract onRemovedNode(nodeView: NodeView): void;

  abstract onAddedEdge(edgeView: EdgeView): void;

  abstract onRemovedEdge(edgeView: EdgeView): void;

  abstract onGraphCleared(): void;

  abstract onGraphViewGenerated(): void;

  abstract onUndoInvoked(): void;

  abstract onRedoInvoked(): void;

}

/**
 * Interface defines mode behavior.
 */
export interface ModeBehavior {
  modeOn(): void;

  modeOff(): void;

  onAddedNode(nodeView: NodeView): void;

  onBeforeNodeDeleted(nodeView: NodeView): void;

  onRemovedNode(nodeView: NodeView): void;

  onAddedEdge(edgeView: EdgeView): void;

  onRemovedEdge(edgeView: EdgeView): void;

  onGraphCleared(): void;

  onGraphViewGenerated(): void;

  onUndoInvoked(): void;

  onRedoInvoked(): void;
}

/**
 * Mode states. Defines the name of the mode.
 */
export type ModeState = 'AddRemoveVertex' | 'AddRemoveEdge' | 'default' | 'SelectionMode' | 'Algorithm';

/**
 * Submode states. Defines the name of the submode.
 */
export type SubmodeState = 'none' | 'force' | 'BFS' | 'DFS' | 'Dijkstra';
