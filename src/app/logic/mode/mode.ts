import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";

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

export interface AlgorithmSubmode extends Submode {

  /**
   * Reset algorithm.
   * Change the state of the algorithm to the initial state.
   */
  resetAlgorithm(): void;
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
