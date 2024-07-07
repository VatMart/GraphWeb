import {Injectable} from '@angular/core';
import {AppData} from "./file.service";
import {GraphViewService} from "./graph/graph-view.service";
import {GraphViewProperties} from "../model/graphical-model/graph/graph-view-properties";
import {ConfService} from "./config/conf.service";
import {StateService} from "./event/state.service";
import {GraphView} from "../model/graphical-model/graph/graph-view";
import {PixiManagerService} from "./manager/pixi-manager.service";
import {ForceMode} from "../logic/mode/force-mode";

/**
 * Service for managing the import of files.
 */
@Injectable({
  providedIn: 'root'
})
export class ImportService {

  constructor(private graphService: GraphViewService,
              private pixiManager: PixiManagerService,
              private stateService: StateService) {
  }

  /**
   * Import application data.
   * Steps:
   * 1. Clear all elements view.
   * 2. Close sidebar menu if opened.
   * 2. Stop PixiJS rendering.
   * 3. Import properties and default styles.
   * 4. Reset UI state. (To apply new properties in UI components)
   * 5. Start PixiJS rendering.
   * 6. Import graph.
   */
  public importAppData(appData: AppData): void {
    console.log('Importing app data...'); // TODO: Remove
    // Clear all elements view
    this.graphService.clearAllElementsView(this.graphService.currentGraphView);
    // Close sidebar menu if opened
    this.stateService.closeSidebarMenu();
    // Stop PixiJS rendering
    this.stateService.pixiStopCall();
    // Import properties and default styles
    this.importPropertiesAndDefaultStyles(appData.graphProperties);
    this.stateService.resetUiState();
    // Start PixiJS rendering
    this.pixiManager.startPixi().then(r => {
      // Activate default mode
      this.stateService.changeMode('default');
      this.stateService.changeShowGrid(ConfService.SHOW_GRID);
      // Import graph
      this.importGraph(appData.graph);
      // Notify state service that PIXI is started
      this.stateService.pixiStarted();
    });
  }

  private importPropertiesAndDefaultStyles(graphProperties: GraphViewProperties) {
    // Set default graph orientation
    if (graphProperties.graphOrientation !== undefined) {
      ConfService.DEFAULT_GRAPH_ORIENTATION = graphProperties.graphOrientation;
    }
    // Set default force properties
    if (graphProperties.enableForceMode !== undefined) {
      ConfService.DEFAULT_FORCE_MODE_ON = graphProperties.enableForceMode;
      ForceMode.activatedByUserMemory = graphProperties.enableForceMode;
    }
    if (graphProperties.enableCenterForce !== undefined) {
      ConfService.DEFAULT_CENTER_FORCE_ON = graphProperties.enableCenterForce;
    }
    if (graphProperties.enableLinkForce !== undefined) {
      ConfService.DEFAULT_LINK_FORCE_ON = graphProperties.enableLinkForce;
    }
    // Show grid
    if (graphProperties.showGrid !== undefined) {
      ConfService.SHOW_GRID = graphProperties.showGrid;
    }
    // Set default graph style
    if (graphProperties.graphStyle !== undefined) {
      ConfService.CURRENT_GRAPH_STYLE = graphProperties.graphStyle;
    }
    // Node properties
    if (graphProperties.nodeProperties !== undefined) {
      if (graphProperties.nodeProperties.dynamicNodeSize !== undefined) {
        ConfService.DYNAMIC_NODE_SIZE = graphProperties.nodeProperties.dynamicNodeSize;
      }
      if (graphProperties.nodeProperties.showLabel !== undefined) {
        ConfService.SHOW_NODE_LABEL = graphProperties.nodeProperties.showLabel;
      }
    }
    // Edge properties
    if (graphProperties.edgeProperties !== undefined) {
      if (graphProperties.edgeProperties.showWeight !== undefined) {
        ConfService.SHOW_WEIGHT = graphProperties.edgeProperties.showWeight;
      }
      if (graphProperties.edgeProperties.dynamicEdgeWeightValue !== undefined) {
        ConfService.DYNAMIC_EDGE_WEIGHT_VALUE = graphProperties.edgeProperties.dynamicEdgeWeightValue;
      }
    }
  }

  private importGraph(graph: GraphView) {
    this.graphService.importFromGraphView(graph);
  }
}
