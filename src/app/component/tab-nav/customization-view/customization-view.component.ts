import { Component } from '@angular/core';
import {TabViewModule} from "primeng/tabview";
import {ColorPickerModule} from "primeng/colorpicker";
import {FormsModule} from "@angular/forms";
import {ConfService} from "../../../service/config/conf.service";
import {SliderModule} from "primeng/slider";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleButtonModule} from "primeng/togglebutton";
import {CheckboxModule} from "primeng/checkbox";
import {NgIf} from "@angular/common";
import {Ripple} from "primeng/ripple";
import {TooltipModule} from "primeng/tooltip";
import {Button} from "primeng/button";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {TagModule} from "primeng/tag";

@Component({
  selector: 'app-customization-view',
  standalone: true,
  imports: [
    TabViewModule,
    ColorPickerModule,
    FormsModule,
    SliderModule,
    InputNumberModule,
    ToggleButtonModule,
    CheckboxModule,
    NgIf,
    Ripple,
    TooltipModule,
    Button,
    OverlayPanelModule,
    TagModule,
  ],
  templateUrl: './customization-view.component.html',
  styleUrl: './customization-view.component.css'
})
export class CustomizationViewComponent {

  // Global
  unsavedChanges: boolean = true; // TODO implement saving changes

  // Node tab items
  // Node colors
  nodeColor: string | undefined = ConfService.DEFAULT_NODE_STYLE.fillNode;
  nodeStrokeColor: string | undefined = ConfService.DEFAULT_NODE_STYLE.strokeColor;
  nodeLabelColor: string | undefined = ConfService.DEFAULT_NODE_LABEL_STYLE.labelColor;
  // Node sizes
  nodeRadius: number = ConfService.DEFAULT_RADIUS;
  nodeStrokeWidth: number = ConfService.DEFAULT_NODE_STYLE.strokeWidth;
  nodeLabelFontSize: number = ConfService.DEFAULT_NODE_LABEL_STYLE.labelFontSize;
  // Node properties
  showNodeLabel: boolean = true;
  showNodeStroke: boolean = true;
  dynamicNodeSize: boolean = false; // TODO implement dynamic node size

  // Edge tab items
  // Edge colors
  edgeColor: string = ConfService.DEFAULT_EDGE_STYLE.strokeColor;
  edgeWeightColor: string = ConfService.DEFAULT_WEIGHT_STYLE.strokeColor; // Color of stroke and label
  edgeArrowColor: string = ConfService.DEFAULT_ARROW_STYLE.strokeColor;
  // TODO add edge label
  // Edge sizes
  edgeStrokeWidth: number = ConfService.DEFAULT_EDGE_STYLE.strokeWidth;
  edgeWeightSize: number = ConfService.DEFAULT_TEXT_WEIGHT_STYLE.size;
  edgeArrowSize: number = ConfService.DEFAULT_ARROW_STYLE.size;
  // Edge properties
  showEdgeWeight: boolean = true; // TODO remove from toolbar
  dynamicEdgeWeight: boolean = false; // TODO implement dynamic edge weight
  // TODO add showing edge label
  // TODO add option for turning edges to curves

  // Template tab items
  // TODO

  // TEST
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return `${value}`;
  }

  protected readonly ConfService = ConfService;
}
