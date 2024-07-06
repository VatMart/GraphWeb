import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as PIXI from "pixi.js";
import {StateService} from "../../service/event/state.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph/graph-view.service";
import {Graph} from "../../model/graph";
import {EventBusService} from "../../service/event/event-bus.service";
import {NodeViewFabricService} from "../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/fabric/edge-view-fabric.service";
import {PixiManagerService} from "../../service/manager/pixi-manager.service";
import {GraphView} from "../../model/graphical-model/graph/graph-view";

/**
 * Component for the main canvas.
 */
@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private graphViewService: GraphViewService,
              private pixiManager: PixiManagerService) {
  }

  async ngAfterViewInit(): Promise<void> {
    await document.fonts.ready; // Wait for fonts to load
    // Start PIXI after the view canvas container is initialized
    await this.pixiManager.startPixi();
    // Notify state service that PIXI is started
    this.stateService.pixiStarted();
    // Resize canvas on container resize
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.canvasContainer.nativeElement);
    //this.graphViewService.initializeGraphView(); // Init graph view // TODO uncomment in production
    //this.stateService.changeMode('default'); // Change mode to default // TODO uncomment in production

    // ----------------- TODO Remove below -----------------
    let graph: Graph = new Graph();
    let graphView = new GraphView(graph);
    this.graphViewService.currentGraphView = graphView;
    this.stateService.changeMode('default'); // Enable default mode
    // this.stateService.changeForceModeState(false); // Disable force mode
    // ConfService.DYNAMIC_NODE_SIZE = false; // Disable dynamic node size

    let screenCenter = {x: this.pixiService.renderer.screen.width / 2,
      y: this.pixiService.renderer.screen.height / 2};

    let node1 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
      x: screenCenter.x,
      y: screenCenter.y + 30
    });
    this.graphViewService.addNodeToGraphView(graphView, node1);
    let node2 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
      x: screenCenter.x - 155,
      y: screenCenter.y - 160
    });
    this.graphViewService.addNodeToGraphView(graphView, node2);
    let node3 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
      x: screenCenter.x + 170,
      y: screenCenter.y
    });
    this.graphViewService.addNodeToGraphView(graphView, node3);
    let node4 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graphView, {
      x: screenCenter.x - 30,
      y: screenCenter.y - 160
    });
    this.graphViewService.addNodeToGraphView(graphView, node4);
    // Create edges
    let edge1 = this.edgeFabric.createDefaultEdgeView(graphView, node3, node2);
    //edge2.changeEdgeOrientation(EdgeOrientation.NON_ORIENTED)
    this.graphViewService.addEdgeToGraphView(graphView, edge1);
    let edge2 = this.edgeFabric.createDefaultEdgeView(graphView, node4, node2);
    this.graphViewService.addEdgeToGraphView(graphView, edge2);
    let edge3 = this.edgeFabric.createDefaultEdgeView(graphView, node4, node3);
    this.graphViewService.addEdgeToGraphView(graphView, edge3);

    (window as any).__PIXI_DEVTOOLS__ = { // TODO remove in production
      pixi: PIXI,
      renderer: this.pixiService.renderer,
      stage: this.pixiService.stage
    };
  }

  private onResize(): void {
    this.stateService.needResizeCanvas();
  }
}
