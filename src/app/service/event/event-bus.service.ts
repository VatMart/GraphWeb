import { Injectable } from '@angular/core';
import { Subject, Subscription } from "rxjs";
import * as PIXI from 'pixi.js';

/**
 * Service that provides a way to manage events in the application.
 */
@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubjects = new Map<string, Subject<any>>();
  private eventSubscriptions = new Map<string, Map<any, Subscription>>();
  private handlers = new Map<string, any>(); // Handlers storage of the application

  constructor() { }

  /**
   * Registers an event on the specified PIXI.EventEmitter and subscribes it
   * to a corresponding Subject to manage through the EventBus.
   */
  public registerPixiEvent(target: PIXI.EventEmitter, event: string, handlerName: string, handler?: any) {
    if (!handler) {
      if (!this.hasHandler(handlerName)) {
        console.error(`Can't register handler. Handler: ${handlerName} is not registered.`); // TODO throw exception
        return;
      } else {
        handler = this.getHandler(handlerName); // Get the handler from the map
      }
    } else if (!this.hasHandler(handlerName)) {
      this.registerHandler(handlerName, handler);
    }
    target.on(event, handler);  // Attach handler to the PIXI object
    let sub = this.getEventSubject(event).subscribe(handler);  // Subscribe handler to the Subject
    if (!this.eventSubscriptions.has(event)) {
      this.eventSubscriptions.set(event, new Map<any, Subscription>());
    }
    this.eventSubscriptions.get(event)?.set(handler, sub);  // Store the subscription
  }

  /**
   * Unregisters an event from the specified PIXI.EventEmitter and unsubscribes
   * it from the corresponding Subject.
   */
  public unregisterPixiEvent(target: PIXI.EventEmitter, event: string, handler: any | string) {
    let handlerFunction;
    if (typeof handler === 'string' && this.hasHandler(handler)) {
      handlerFunction = this.getHandler(handler);
    } else {
      handlerFunction = handler;
    }
    target.off(event, handlerFunction);  // Detach handler from the PIXI object
    let subs = this.eventSubscriptions.get(event);
    if (subs?.has(handlerFunction)) {
      subs.get(handlerFunction)?.unsubscribe();  // Unsubscribe the handler
      subs.delete(handlerFunction);  // Remove the handler from the map
      if (subs.size === 0) {
        this.eventSubjects.get(event)?.complete();  // Complete the subject if no more subscribers
        this.eventSubjects.delete(event);
        this.eventSubscriptions.delete(event);
      }
    }
  }

  /**
   * Registers a TypeScript event and subscribes the handler to the corresponding Subject.
   */
  public registerTsEvent(target: EventTarget, event: string, handlerName: string, handler?: any) {
    if (!handler) {
      if (!this.hasHandler(handlerName)) {
        console.error(`Can't register handler. Handler: ${handlerName} is not registered.`); // TODO throw exception
        return;
      } else {
        handler = this.getHandler(handlerName); // Get the handler from the map
      }
    } else if (!this.hasHandler(handlerName)) {
      this.registerHandler(handlerName, handler);
    }
    target.addEventListener(event, handler);  // Attach handler to the event target
    let sub = this.getEventSubject(event).subscribe(handler);  // Subscribe handler to the Subject
    if (!this.eventSubscriptions.has(event)) {
      this.eventSubscriptions.set(event, new Map<any, Subscription>());
    }
    this.eventSubscriptions.get(event)?.set(handler, sub);  // Store the subscription
  }

  /**
   * Unregisters a TypeScript event and unsubscribes it from the corresponding Subject.
   */
  public unregisterTsEvent(target: EventTarget, event: string, handler: any | string) {
    let handlerFunction;
    if (typeof handler === 'string' && this.hasHandler(handler)) {
      handlerFunction = this.getHandler(handler);
    } else {
      handlerFunction = handler;
    }
    target.removeEventListener(event, handlerFunction);  // Detach handler from the event target
    let subs = this.eventSubscriptions.get(event);
    if (subs?.has(handlerFunction)) {
      subs.get(handlerFunction)?.unsubscribe();  // Unsubscribe the handler
      subs.delete(handlerFunction);  // Remove the handler from the map
      if (subs.size === 0) {
        this.eventSubjects.get(event)?.complete();  // Complete the subject if no more subscribers
        this.eventSubjects.delete(event);
        this.eventSubscriptions.delete(event);
      }
    }
  }

  public registerHammerEvent(target: HammerManager, recognizer: Recognizer, event: string, handlerName: string, handler?: any) {
    if (!handler) {
      if (!this.hasHandler(handlerName)) {
        console.error(`Can't register handler. Handler: ${handlerName} is not registered.`); // TODO throw exception
        return;
      } else {
        handler = this.getHandler(handlerName); // Get the handler from the map
      }
    } else if (!this.hasHandler(handlerName)) {
      this.registerHandler(handlerName, handler);
    }
    target.add(recognizer);
    target.on(event, handler);  // Attach handler to the Hammer object
    let sub = this.getEventSubject(event).subscribe(handler);  // Subscribe handler to the Subject
    if (!this.eventSubscriptions.has(event)) {
      this.eventSubscriptions.set(event, new Map<any, Subscription>());
    }
    this.eventSubscriptions.get(event)?.set(handler, sub);  // Store the subscription
  }

  public unregisterHammerEvent(target: HammerManager, recognizer: Recognizer, event: string, handler: any | string) {
    let handlerFunction;
    if (typeof handler === 'string' && this.hasHandler(handler)) {
      handlerFunction = this.getHandler(handler);
    } else {
      handlerFunction = handler;
    }
    target.remove(recognizer);
    target.off(event, handlerFunction);  // Detach handler from the Hammer object
    let subs = this.eventSubscriptions.get(event);
    if (subs?.has(handlerFunction)) {
      subs.get(handlerFunction)?.unsubscribe();  // Unsubscribe the handler
      subs.delete(handlerFunction);  // Remove the handler from the map
      if (subs.size === 0) {
        this.eventSubjects.get(event)?.complete();  // Complete the subject if no more subscribers
        this.eventSubjects.delete(event);
        this.eventSubscriptions.delete(event);
      }
    }
  }

  /**
   * Emits data to all subscribers of the specified event.
   */
  public emit(event: string, data: any) {
    this.getEventSubject(event).next(data);
  }

  /**
   * Retrieves or creates a new Subject for the specified event.
   */
  private getEventSubject(event: string): Subject<any> {
    if (!this.eventSubjects.has(event)) {
      this.eventSubjects.set(event, new Subject<any>());
    }
    return this.eventSubjects.get(event)!;
  }

  // Handlers management

  /**
   * Registers a handler in the handlers map.
   */
  public registerHandler(handlerName: string, handler: any): void {
    if (this.handlers.has(handlerName)) {
      console.log(`Can't register handler. Handler: ${handlerName}  already registered.`);
      return;
    }
    this.handlers.set(handlerName, handler);
  }

  /**
   * Retrieves a handler from the handlers map.
   */
  public getHandler(name: string): any {
    if (!this.handlers.has(name)) {
      console.log(`Can't get handler. Handler: ${name} is not registered.`);
      throw new Error("Handler not found");
    }
    return this.handlers.get(name);
  }

  /**
   * Checks if a handler is registered.
   */
  public hasHandler(name: string): boolean {
    return this.handlers.has(name);
  }

  /**
   * Removes a handler from the handlers map.
   * It is not recommended to remove handlers that are used in the application. Otherwise, the application
   * may not work correctly.
   */
  public removeHandler(name: string): boolean {
    if (!this.handlers.has(name)) {
      console.log(`Can't remove handler. Handler: ${name} is not registered.`);
    }
    return this.handlers.delete(name);
  }

  /**
   * Destroys all subscriptions and clears the handlers map.
   */
  public destroy() {
    this.handlers.clear();
    this.eventSubjects.clear();
    this.eventSubscriptions.clear();
  }
}

/**
 * Names of the handlers used in the application.
 */
export const HandlerNames = {
  // Node handlers
  NODE_DRAG_START: 'nodeDragStart', // Handler for the node drag start event
  NODE_DRAG_END: 'nodeDragEnd', // Handler for the node drag end event
  NODE_DRAG_MOVE: 'nodeDragMove', // Handler for the node drag move event

  // Edge handlers
  EDGE_WEIGHT_CHANGE: 'edgeWeightChange', // Handler for the edge weight change event

  // Selection handlers
  ELEMENT_SELECT: 'elementSelect', // Handler for the element select event
  RECTANGLE_SELECTION_MOVE: 'rectangleSelectionMove', // Handler for the rectangle selection start event
  RECTANGLE_SELECTION_END: 'rectangleSelectionEnd', // Handler for the rectangle selection end event
  MULTI_SELECTION: 'multiSelection', // Handler for the multi selection event (Only for mobiles)

  // Canvas handlers
  CANVAS_CURSOR_MOVE: 'canvasCursorMove', // Handler for the canvas cursor move
  CANVAS_CONTEXT_MENU: 'canvasContextMenu', // Handler for the canvas context menu
  CANVAS_ADD_REMOVE_NODE: 'canvasAddRemoveNode', // Handler for the node add/remove for click on canvas/node
  CANVAS_ADD_REMOVE_EDGE: 'canvasAddRemoveEdge', // Handler for the node add edge event
  CANVAS_RESIZE: 'canvasResize', // Handler for the canvas resize event
  CANVAS_DRAG_START: 'canvasDragStart', // Handler for the canvas drag start event
  CANVAS_DRAG_MOVE: 'canvasDragMove', // Handler for the canvas drag move event
  CANVAS_DRAG_END: 'canvasDragEnd', // Handler for the canvas drag end event
  CANVAS_ZOOM: 'canvasZoom', // Handler for the canvas zooming event
  // Canvas touchscreen handlers
  CANVAS_PINCH_START: 'canvasPinchStart', // Handler for the canvas pinch start event
  CANVAS_PINCH_ZOOM: 'canvasPinchZoom', // Handler for the canvas pinch zoom event

  // Algorithm handlers
  SHORTEST_PATH_SELECTION: 'shortestPathSelection', // Handler for the shortest path selection event
}
