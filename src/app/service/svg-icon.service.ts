import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SvgIconService {

  private icons: { [key: string]: string } = {};

  constructor() { }

  addIcon(name: string, svg: string): void {
    this.icons[name] = svg;
  }

  getIcon(name: string): string | undefined {
    return this.icons[name];
  }
}
