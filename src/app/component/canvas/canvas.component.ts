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
    // Start PIXI after the view canvas container is initialized
    await this.pixiManager.startPixi();
    // Resize canvas on container resize
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.canvasContainer.nativeElement);


    // ----------------- TODO Remove below -----------------
    let graph: Graph = new Graph(); // TODO create graph via graph model service
    this.graphViewService.currentGraph = graph; // TODO Change creating graph behaviour

    let screenCenter = {x: this.pixiService.renderer.screen.width / 2,
      y: this.pixiService.renderer.screen.height / 2};

    let node1 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graph, {
      x: screenCenter.x + 100,
      y: screenCenter.y - 100
    });
    this.graphViewService.addNodeToGraphView(graph, node1);
    let node2 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graph, {
      x: screenCenter.x + 100,
      y: screenCenter.y + 100
    });
    this.graphViewService.addNodeToGraphView(graph, node2);
    let node3 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graph, {
      x: screenCenter.x - 100,
      y: screenCenter.y - 100
    });
    this.graphViewService.addNodeToGraphView(graph, node3);
    // Create edges
    let edge1 = this.edgeFabric.createDefaultEdgeView(graph, node1, node2);
    this.graphViewService.addEdgeToGraphView(graph, edge1);
    let edge2 = this.edgeFabric.createDefaultEdgeView(graph, node2, node3);
    this.graphViewService.addEdgeToGraphView(graph, edge2);

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
