import {ChangeDetectorRef, Component} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {StateService} from "../../../service/event/state.service";
import {AlgorithmCalculationRequest, ShortestPathRequest} from "../../../service/manager/algorithm-manager.service";
import {Button} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {AlgorithmType} from "../../../model/Algorithm";
import {GraphViewService} from "../../../service/graph/graph-view.service";

/**
 * Algorithm dialog component.
 * Used to display a dialog for confirm algorithm calculation.
 */
@Component({
  selector: 'app-algorithm-dialog',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    InputTextModule,
    NgIf
  ],
  templateUrl: './algorithm-dialog.component.html',
  styleUrl: './algorithm-dialog.component.css'
})
export class AlgorithmDialogComponent {

  request!: AlgorithmCalculationRequest;

  text: string = '';

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private cdr: ChangeDetectorRef,
              private graphService: GraphViewService,
              private stateService: StateService) {
    this.request = config.data.request;
    this.resolveTextDialog(config.data.request);
  }

  onStart() {
    this.ref.close();
    this.cdr.detectChanges();
    this.stateService.performAlgorithmCalculation(this.request);
  }

  onCancel() {
    this.ref.close();
    this.cdr.detectChanges();
    this.stateService.callResetAlgorithm();
  }

  private resolveTextDialog(request: AlgorithmCalculationRequest) {
    if (request.algorithmType === AlgorithmType.SHORTEST_PATH) {
      const shortestPathRequest = request as ShortestPathRequest;
      const startLabel = this.graphService.currentGraph.getNodes().get(shortestPathRequest.startNodeIndex)!.label;
      const endLabel = this.graphService.currentGraph.getNodes().get(shortestPathRequest.endNodeIndex)!.label;
      this.text = 'Find shortest path from node \'' + startLabel + '\' to node \'' +
        endLabel + '\' using ' + shortestPathRequest.algorithm + ' algorithm.'
      return;
    }
    if (request.algorithmType === AlgorithmType.TRAVERSE) {
      const traverseRequest = request as ShortestPathRequest;
      const startLabel = this.graphService.currentGraph.getNodes().get(traverseRequest.startNodeIndex)!.label;
      this.text = 'Traverse graph starting from node \'' + startLabel + '\' using ' + traverseRequest.algorithm +
        ' algorithm.'
      return;
    }
  }
}
