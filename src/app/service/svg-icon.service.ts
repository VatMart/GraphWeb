import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SvgIconService {

  private icons: { [key: string]: string } = {
    'matrix-icon': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M3 4v16h3v-2H5V6h1V4zm15 0v2h1v12h-1v2h3V4zm-3.248 4.424c-.499-.01-1.002.113-1.406.39-.26.18-.484.408-.74.627-.392-.777-1.098-.984-1.905-.998-.818-.013-1.451.358-2.02 1.036V8.64H7v6.347h1.787s-.003-2.38.002-3.554c.001-.21.012-.422.055-.627.132-.628.67-1.015 1.314-.963.613.05.892.383.922 1.107.005.126.008 4.033.008 4.033h1.81s-.007-2.471.004-3.521c.003-.271.03-.549.096-.81.148-.589.625-.876 1.273-.805.572.062.859.378.9 1V15h1.804s.029-3.12 0-4.602a2.2 2.2 0 0 0-.24-.902c-.333-.667-1.152-1.055-1.983-1.072"/></svg>`,
    'custom-icon1': `<svg ...>...</svg>` // TODO
  };

  constructor() { }

  getIcon(name: string): string | undefined {
    return this.icons[name];
  }
}
