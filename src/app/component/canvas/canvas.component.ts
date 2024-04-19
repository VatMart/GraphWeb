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

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements OnInit {
  // TODO create separate canvas on stage

  // CursorCoordinates
  xCursor: number = 0;
  yCursor: number = 0;

  constructor(private pixiService: PixiService,
              private http: HttpClient,
              private stateService: StateService,
              private graphViewService: GraphViewService) {
  }

  async ngOnInit(): Promise<void> {
    this.setDefaultListeners();
    let someElement = document.getElementById('testId');
    // document.documentElement.clientHeight
    await this.pixiService.getApp().init({antialias: true, background: '#1099bb', width: window.innerWidth,
      height: window.innerHeight});
    document.body.appendChild(this.pixiService.getApp().canvas);
    // TODO move to Pixi service
    this.pixiService.getApp().stage.eventMode = 'dynamic';
    this.pixiService.getApp().stage.hitArea = this.pixiService.getApp().screen;

    let graph: Graph = new Graph(); // TODO create graph via graph model service
    this.graphViewService.currentGraph = graph; // TODO Change creating graph behaviour

    let nodeGraphical = NodeView.create(this.http, new Node(1),
      {x: 200, y: 200}, 100); // TODO move creation of node
    this.graphViewService.addNodeToGraphView(graph, nodeGraphical);

    // TEST Radius changes TODO REMOVE
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      console.log(`Key pressed: ${event.key}`);
      if (event.key === 'ArrowUp') {
        nodeGraphical.radius--;
        console.log(`rad: ${nodeGraphical.radius}`);
        nodeGraphical.redraw();
      }
    });
  }

  private setDefaultListeners()  {
    // CanvasCoordinates
    this.pixiService.getApp().stage.on('pointermove', (event) => {
      this.xCursor = event.globalX;
      this.yCursor = event.globalY;
      this.stateService.changeCursorX(this.xCursor)
      this.stateService.changeCursorY(this.yCursor)
    });

  }

}
