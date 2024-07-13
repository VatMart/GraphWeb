import {Command} from "./command";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {GraphElement} from "../../model/graphical-model/graph-element";

/**
 * Command to remove selected elements from the graph view.
 */
export class RemoveSelectedElementsCommand implements Command {
  private selectedElements: GraphElement[];

  constructor(private graphService: GraphViewService,
              elements: GraphElement[]) {
    this.selectedElements = Array.from(elements);
  }

  execute(): void {
    this.graphService.removeGraphElements(this.graphService.currentGraphView, this.selectedElements);
  }

  undo(): void {
    this.graphService.addGraphElements(this.graphService.currentGraphView, this.selectedElements);
  }

  redo(): void {
    this.execute();
  }
}
