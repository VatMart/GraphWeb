import {Component, OnInit} from '@angular/core';
import * as PIXI from "pixi.js";
import {Container, FederatedPointerEvent, Graphics} from "pixi.js";
import {NodeView} from "../../model/graphical-model/node-view";
import {Node} from "../../model/node";
import {HttpClient} from "@angular/common/http";
import {StateService} from "../../service/state.service";
import {PixiService} from "../../service/pixi.service";
import {GraphViewService} from "../../service/graph-view.service";
import {Graph} from "../../model/graph";
import {EventBusService, HandlerNames} from "../../service/event/event-bus.service";

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

  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  constructor(private pixiService: PixiService,
              private stateService: StateService,
              private eventBus: EventBusService,
              private graphViewService: GraphViewService) {
    this.boundHandleCursorMoving = this.handlePointerDown.bind(this);
    // Registering event handlers
    this.eventBus.registerHandler(HandlerNames.CANVAS_CURSOR_MOVE, this.boundHandleCursorMoving);
  }

  async ngOnInit(): Promise<void> {
    this.setDefaultListeners();
    let someElement = document.getElementById('testId');
    // document.documentElement.clientHeight
    await this.pixiService.getApp().init({antialias: true, background: '#e0e0e0', width: window.innerWidth,
      height: window.innerHeight});
    document.body.appendChild(this.pixiService.getApp().canvas);
    // TODO move to Pixi service
    this.pixiService.getApp().stage.eventMode = 'dynamic';
    this.pixiService.getApp().stage.hitArea = this.pixiService.getApp().screen;

    let graph: Graph = new Graph(); // TODO create graph via graph model service
    this.graphViewService.currentGraph = graph; // TODO Change creating graph behaviour

    let nodeGraphical = NodeView.create(new Node(1),
      {x: 200, y: 200}, 100); // TODO move creation of node
    this.graphViewService.addNodeToGraphView(graph, nodeGraphical);
  }

  private setDefaultListeners()  {
    // Moving cursor on canvas
    this.eventBus.registerPixiEvent(this.pixiService.getApp().stage, 'pointermove', HandlerNames.CANVAS_CURSOR_MOVE);
    this.pixiService.getApp().stage.on('pointermove', this.handlePointerDown.bind(this));
  }

  handlePointerDown(event: FederatedPointerEvent): void {
    this.xCursor = event.globalX;
    this.yCursor = event.globalY;
    this.stateService.changeCursorX(this.xCursor)
    this.stateService.changeCursorY(this.yCursor)
  }

}
