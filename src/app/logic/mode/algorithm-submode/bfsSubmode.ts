import {AlgorithmSubmode, Submode, SubmodeState} from "../mode";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../../model/graphical-model/node/node-view";

/**
 * BFS submode impl
 */
export class BfsSubmode implements AlgorithmSubmode {
  readonly submodeState: SubmodeState = 'BFS';
  private active: boolean = false;

  constructor() {
  }

  modeOn(): void {
    console.log("BfsSubmode ON");
    this.active = true;
  }

  modeOff(): void {
    console.log("BfsSubmode OFF");
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  resetAlgorithm(): void {
    // TODO
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onAddedNode(nodeView: NodeView): void {
  }

  onBeforeNodeDeleted(nodeView: NodeView): void {
  }

  onGraphCleared(): void {
  }

  onGraphViewGenerated(): void {
  }

  onRedoInvoked(): void {
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
  }

  onUndoInvoked(): void {
  }
}
