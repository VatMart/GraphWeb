import {AlgorithmSubmode, Submode, SubmodeState} from "../mode";
import {EdgeView} from "../../../model/graphical-model/edge/edge-view";
import {NodeView} from "../../../model/graphical-model/node/node-view";

/**
 * DFS submode impl
 */
export class DfsSubmode implements AlgorithmSubmode {
  readonly submodeState: SubmodeState = 'DFS';
  private active: boolean = false;

  constructor() {
  }

  modeOn(): void {
    console.log("DfsSubmode ON");
    this.active = true;
  }

  modeOff(): void {
    console.log("DfsSubmode OFF");
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
