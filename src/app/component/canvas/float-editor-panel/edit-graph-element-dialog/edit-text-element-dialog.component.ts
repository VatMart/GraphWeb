import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {Button} from "primeng/button";
import {NgIf} from "@angular/common";
import {NodeView} from "../../../../model/graphical-model/node/node-view";
import {EdgeView} from "../../../../model/graphical-model/edge/edge-view";
import {ConfService} from "../../../../service/config/conf.service";
import {ChangeNodeLabelCommand} from "../../../../logic/command/change-node-label-command";
import {GraphViewPropertiesService} from "../../../../service/graph/graph-view-properties.service";
import {HistoryService} from "../../../../service/history.service";
import {StateService} from "../../../../service/event/state.service";
import {ChangeEdgeWeightCommand} from "../../../../logic/command/change-edge-weight-command";

@Component({
  selector: 'app-edit-graph-element-dialog',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    Button,
    NgIf
  ],
  templateUrl: './edit-text-element-dialog.component.html',
  styleUrl: './edit-text-element-dialog.component.css'
})
export class EditTextElementDialogComponent {

  nodeLabel?: string;
  type!: 'nodeLabelEdit' | 'edgeWeightEdit';
  edgeWeight?: string;

  // NodeLabelEdit
  private nodeView?: NodeView;

  // EdgeWeightEdit
  private edgeView?: EdgeView;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private propertyService: GraphViewPropertiesService,
              private historyService: HistoryService,
              private stateService: StateService) {
    this.type = config.data.type;
    if (this.type === 'nodeLabelEdit') {
      this.nodeView = config.data.nodeView;
      this.nodeLabel = this.nodeView!.node.label;
    } else if (this.type === 'edgeWeightEdit') {
      this.edgeView = config.data.edgeView;
      this.edgeWeight = this.edgeView!.weightView.value!.toString();
    }
  }

  onApply() {
    if (this.type === 'nodeLabelEdit') {
      this.validateAndTrySaveNodeLabel();
    } else if (this.type === 'edgeWeightEdit') {
      this.validateAndTrySaveEdgeWeight();
    }
    this.ref.close();
  }

  private validateAndTrySaveNodeLabel() {
    if (this.nodeLabel === undefined) {
      return;
    }
    if (this.nodeLabel.length > ConfService.MAX_NODE_LABEL_LENGTH) {
      this.stateService.notifyError('Node label is too long. Max length of label is ' +
        ConfService.MAX_NODE_LABEL_LENGTH + ' characters');
      return; // Label is too long
    }
    const command = new ChangeNodeLabelCommand(this.propertyService, this.nodeView!,
      this.nodeLabel);
    this.historyService.execute(command);
  }

  private validateAndTrySaveEdgeWeight() {
    if (this.edgeWeight === undefined) {
      return;
    }
    const number = Number(this.edgeWeight);
    if (isNaN(number)) {
      this.stateService.notifyError('Edge weight is not a valid number! input: ' + this.edgeWeight);
      return;
    }
    if (number < ConfService.MIN_WEIGHT || number > ConfService.MAX_WEIGHT) {
      this.stateService.notifyError(`Input value is out of range. Must be between ${ConfService.MIN_WEIGHT} and ${ConfService.MAX_WEIGHT}.`);
      return;
    }
    const command = new ChangeEdgeWeightCommand(this.propertyService, this.edgeView!, number);
    this.historyService.execute(command);
  }
}
