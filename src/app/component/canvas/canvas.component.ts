import {Component, OnInit} from '@angular/core';
import {FederatedPointerEvent} from "pixi.js";
import {StateService} from "../../service/state.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph-view.service";
import {Graph} from "../../model/graph";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";
import {NodeViewFabricService} from "../../service/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/edge-view-fabric.service";

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
export class CanvasComponent implements OnInit {
  // TODO create separate canvas on stage
  private boundHandleCursorMoving: (event: FederatedPointerEvent) => void;
  private boundHandleContextMenu: (event: any) => void;

  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private eventBus: EventBusService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private graphViewService: GraphViewService) {
    this.boundHandleCursorMoving = this.handlePointerDown.bind(this);
    this.boundHandleContextMenu = this.handlerContextMenu.bind(this);
    // Registering event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_CURSOR_MOVE, this.boundHandleCursorMoving);
    this.eventBus.registerHandler(HandlerNames.CANVAS_CONTEXT_MENU, this.boundHandleContextMenu)
  }

  async ngOnInit(): Promise<void> {
    let someElement = document.getElementById('testId');
    // document.documentElement.clientHeight
    await this.pixiService.getApp().init({
      antialias: true, background: '#e0e0e0', width: window.innerWidth,
      height: window.innerHeight - 200
    });
    document.body.appendChild(this.pixiService.getApp().canvas);
    // TODO move to Pixi service
    this.pixiService.getApp().stage.eventMode = 'dynamic';
    this.pixiService.getApp().stage.hitArea = this.pixiService.getApp().screen;

    let graph: Graph = new Graph(); // TODO create graph via graph model service
    this.graphViewService.currentGraph = graph; // TODO Change creating graph behaviour

    let node1 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graph, {x: 200, y: 200});
    this.graphViewService.addNodeToGraphView(graph, node1);
    let node2 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graph, {x: 300, y: 500});
    this.graphViewService.addNodeToGraphView(graph, node2);
    let node3 = this.nodeFabric.createDefaultNodeViewWithCoordinates(graph, {x: 500, y: 200});
    this.graphViewService.addNodeToGraphView(graph, node3);
    // Create edges
    let edge1 = this.edgeFabric.createDefaultEdgeView(graph, node1, node2);
    this.graphViewService.addEdgeToGraphView(graph, edge1);
    let edge2 = this.edgeFabric.createDefaultEdgeView(graph, node2, node3);
    this.graphViewService.addEdgeToGraphView(graph, edge2);

    this.setDefaultListeners();
  }

  private setDefaultListeners() {
    // Moving cursor on canvas
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointermove', HandlerNames.CANVAS_CURSOR_MOVE);
    this.pixiService.getApp().canvas.addEventListener('contextmenu', this.boundHandleContextMenu); // TODO move to event bus
  }

  handlePointerDown(event: FederatedPointerEvent): void {
    this.xCursor = event.globalX;
    this.yCursor = event.globalY;
    this.stateService.changeCursorX(this.xCursor)
    this.stateService.changeCursorY(this.yCursor)
  }

  handlerContextMenu(event: any): void {
    event.preventDefault();
    console.log("Context menu")
    // TODO add context menu
  }

}
