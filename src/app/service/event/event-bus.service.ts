import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import * as PIXI from 'pixi.js';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubjects = new Map<string, Subject<any>>();

  constructor() { }

  public registerPixiEvent(target: PIXI.EventEmitter, event: string, handler: any) {
    target.on(event, handler);
    this.getEventSubject(event).subscribe(handler);
  }

  public unregisterPixiEvent(target: PIXI.EventEmitter, event: string, handler: any) {
    target.off(event, handler);
    this.getEventSubject(event).unsubscribe();
  }

  public emit(event: string, data: any) {
    this.getEventSubject(event).next(data);
  }

  private getEventSubject(event: string): Subject<any> {
    if (!this.eventSubjects.has(event)) {
      this.eventSubjects.set(event, new Subject<any>());
    }
    return this.eventSubjects.get(event)!;
  }
}
