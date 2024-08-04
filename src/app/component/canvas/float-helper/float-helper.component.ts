import {Component, OnDestroy, OnInit} from '@angular/core';
import {RippleModule} from "primeng/ripple";
import {NgIf} from "@angular/common";
import {StateService} from "../../../service/event/state.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Subscription} from "rxjs";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

/**
 * Float helper component. Placed on top of the canvas.
 */
@Component({
  selector: 'app-float-helper',
  standalone: true,
  imports: [
    RippleModule,
    NgIf
  ],
  templateUrl: './float-helper.component.html',
  styleUrl: './float-helper.component.css',
  animations: [
    trigger('fade', [
      state('void', style({opacity: 0})),
      transition(':enter, :leave', [
        animate(200)
      ]),
    ]),
  ]
})
export class FloatHelperComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;

  showHelper: boolean = true;
  currentHelperItem!: FloatHelperItem;
  sanitizedHtmlContent!: SafeHtml;

  constructor(private stateService: StateService,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.subscriptions = new Subscription();
    // Subscribe to changes of float helper item
    this.subscriptions.add(
      this.stateService.currentFloatHelperItem$.subscribe(item => {
        if (!this.showHelper) {
          this.showHelper = true;
        }
        this.currentHelperItem = item;
        this.sanitizedHtmlContent = this.sanitizer.bypassSecurityTrustHtml(item.htmlContent);
      }));
    // Set default helper item if not set by state service
    this.currentHelperItem = DEFAULT_HELPER_ITEM;
    this.sanitizedHtmlContent = this.sanitizer.bypassSecurityTrustHtml(DEFAULT_HELPER_ITEM.htmlContent);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  onCloseHelper() {
    this.showHelper = false;
  }
}

/**
 * Interface for float helper item
 */
export interface FloatHelperItem {
  htmlContent: string;
}

export const DEFAULT_HELPER_ITEM: FloatHelperItem = {htmlContent: 'Use toolbar to add vertices and edges, or \'Generate\' tab to create graph'};
export const ADD_REMOVE_VERTEX_MODE_HELPER_ITEM: FloatHelperItem = {htmlContent: 'Click on canvas to add vertex. Click on vertex to remove it'};
export const ADD_REMOVE_EDGE_MODE_HELPER_ITEM: FloatHelperItem = {htmlContent: 'Click on two vertices in sequence to add edge. Click on edge to remove it'};
export const EDIT_EDGE_WEIGHT_MODE_HELPER_ITEM: FloatHelperItem = {htmlContent: 'Double click/tap on edge to edit its weight'};
export const SELECT_MODE_HELPER_ITEM: FloatHelperItem = {htmlContent: 'You enabled multiple selection mode. Click on vertex or edge to select/unselect it'};
// Algorithms

export const DIJKSTRA_ALGORITHM_HELPER_ITEM: FloatHelperItem = {htmlContent: 'Select <span style="color: #FFC618; font-size: 16px">start</span> and ' +
    '<span style="color: #FF0000; font-size: 16px">end</span> vertices to find the shortest path'};

export const TRAVERSE_ALGORITHM_HELPER_ITEM: FloatHelperItem = {htmlContent: 'Select <span style="color: #FFC618; font-size: 16px">start</span> vertex to start traverse algorithm'};
