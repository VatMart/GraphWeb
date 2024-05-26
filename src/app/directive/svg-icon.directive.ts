import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {SvgIconService} from "../service/svg-icon.service";

@Directive({
  selector: '[appSvgIcon]',
  standalone: true
})
export class SvgIconDirective implements OnInit {
  @Input('appSvgIcon') iconName: string = '';

  constructor(private el: ElementRef, private iconService: SvgIconService) {}

  ngOnInit(): void {
    const icon = this.iconService.getIcon(this.iconName);
    if (icon) {
      this.el.nativeElement.innerHTML = icon;
    }
  }
}
