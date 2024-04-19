import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  constructor() { }

  public isMobile(): boolean {
    const userAgent = window.navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent);
  }

  public getScreenWidth(): number {
    return window.innerWidth;
  }

  public getScreenHeight(): number {
    return window.innerHeight;
  }
}
