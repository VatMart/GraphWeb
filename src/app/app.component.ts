import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import * as PIXI from 'pixi.js';
import {Container, FederatedPointerEvent, Graphics} from 'pixi.js';
import {NodeGraphical} from "./model/graphical-model/node-graphical";
import {Node} from './model/node';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ToolBarComponent} from "./component/tool-bar/tool-bar.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ClarityModule} from "@clr/angular";
import {NgOptimizedImage} from "@angular/common";
import '@clr/icons';
import '@clr/icons/clr-icons.min.css';
import {ClarityIcons} from "@cds/core/icon";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, ToolBarComponent, ClarityModule, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'GraphWeb';

  private app: PIXI.Application = new PIXI.Application();

  constructor(private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    ClarityIcons.addIcons(['my-custom-icon', 'assets/cog-outline.svg']);
    await this.app.init({antialias: true, background: '#1099bb', resizeTo: window});
    document.body.appendChild(this.app.canvas);
    let vertexContainer = new Container();
    let nodeGraphical = await NodeGraphical.create(this.http, new Node(1), {x: 200, y: 200}, 100)
    let circle = nodeGraphical.graphics;
    circle.interactive = true;
    circle.on('pointerdown', (event) => this.onDragStart(event, nodeGraphical), circle);
    vertexContainer.addChild(circle);
    // TEST Radius changes
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      console.log(`Key pressed: ${event.key}`);
      if (event.key === 'ArrowUp') {
        nodeGraphical.radius--;
        console.log(`rad: ${nodeGraphical.radius}`);
        nodeGraphical.redraw();
      }
    });

    this.app.stage.addChild(vertexContainer);
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
  }

  private dragTarget: NodeGraphical | null = null;

  private onDragStart(event: any, nodeGraphical: NodeGraphical): void {
    const dragObject = event.currentTarget as Graphics;
    const offset = new PIXI.Point();
    offset.x = event.data.global.x - dragObject.x;
    offset.y = event.data.global.y - dragObject.y;
    dragObject.alpha = 0.5;
    this.dragTarget = nodeGraphical;
    //this.app.stage.on('pointermove', this.onDragMove.bind(this));
    this.app.stage.on('pointermove', (event: FederatedPointerEvent) =>
      this.onDragMove(event, offset.x, offset.y));
    this.app.stage.on('pointerup', this.onDragEnd.bind(this));
    this.app.stage.on('pointerupoutside', this.onDragEnd.bind(this));
  }

  private onDragMove(event: FederatedPointerEvent, offsetX: number, offsetY: number): void {
    if (this.dragTarget) {
      const newPosition = event.getLocalPosition(this.app.stage);
      this.dragTarget.coordinates = {x: (event.global.x - offsetX), y: (event.global.y - offsetY)};
    }
  }

  private onDragEnd(): void {
    if (this.dragTarget) {
      this.dragTarget.graphics.alpha = 1;
      //this.app.stage.off('pointermove', this.onDragMove.bind(this));
      this.app.stage.off('pointerup', this.onDragEnd.bind(this));
      this.app.stage.off('pointerupoutside', this.onDragEnd.bind(this));
      this.dragTarget = null;
    }
  }

}
