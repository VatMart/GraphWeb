import {ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild} from '@angular/core';
import {Weight} from "../../../model/graphical-model/edge/weight";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {StateService} from "../../../service/event/state.service";
import {PixiService} from "../../../service/pixi.service";
import {ConfService} from "../../../service/config/conf.service";

@Component({
  selector: 'app-float-edge-weight-input',
  standalone: true,
  imports: [
    ToastModule
  ],
  templateUrl: './float-edge-weight-input.component.html',
  styleUrl: './float-edge-weight-input.component.css',
  providers: [MessageService],
})
export class FloatEdgeWeightInputComponent {
  @ViewChild('floatingInput') floatingInput!: ElementRef;
  @ViewChild('floatingInputContainer') floatingInputContainer!: ElementRef;
  @ViewChild('mirrorSpan') mirrorSpan!: ElementRef;

  editableWeight: Weight | undefined;
  beforeWeightValue: number | undefined;
  currentWeightValue: number | undefined;
  private isInputVisible = false;

  constructor(private renderer: Renderer2,
              private cdr: ChangeDetectorRef,
              private messageService: MessageService,
              private stateService: StateService,
              private pixiService: PixiService) {
  }

  showInput(weight: Weight) {
    const position = weight.getGlobalPosition();
    const inputContainer = this.floatingInputContainer.nativeElement;
    const mirrorSpan = this.mirrorSpan.nativeElement;
    const inputElement = this.floatingInput.nativeElement;
    this.editableWeight = weight;
    this.currentWeightValue = weight.value;
    this.beforeWeightValue = weight.value;
    inputElement.value = weight.value.toString();
    // Change style
    const fontSize = this.calculateFontSize(); // Calculate font size based on zoom scale
    this.renderer.setStyle(inputElement, 'font-size', `${fontSize}px`);
    this.renderer.setStyle(mirrorSpan, 'font-size', `${fontSize}px`);
    this.renderer.setStyle(inputContainer, 'left', `${position.x}px`);
    this.renderer.setStyle(inputContainer, 'top', `${position.y}px`);
    this.renderer.setStyle(inputContainer, 'display', 'block'); // Show input
    this.renderer.setStyle(inputElement, 'visibility', 'hidden'); // Initially hide the input
    this.cdr.detectChanges();
    setTimeout(() => {
      this.adjustWidth(); // Adjust width on show
      this.renderer.setStyle(inputElement, 'visibility', 'visible'); // Make input visible
      inputElement.focus();
      this.isInputVisible = true;
    }, 0);
  }

  onInput(event: Event) {
    const inputElement = this.floatingInput.nativeElement;
    const value = inputElement.value;
    if (value.length > 5) {
      inputElement.value = value.slice(0, 5);
      return;
    }
    // Restrict input to numeric symbols and dot
    const restrictedValue = value.replace(/[^0-9.]/g, '');
    // Allow only one dot
    const parts = restrictedValue.split('.');
    if (parts.length > 2) {
      inputElement.value = parts[0] + '.' + parts.slice(1).join('');
    } else {
      inputElement.value = restrictedValue;
    }
    // Adjust width based on new value
    this.adjustWidth();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.finishEditing();
    }
    if (event.key === 'Escape') {
      this.hideInput();
    }
  }

  finishEditing() {
    const inputElement = this.floatingInput.nativeElement;
    const value = inputElement.value;
    const validationResult = this.validateInput(value);
    if (validationResult.valid) {
      // Call service to change edge weight
      if (this.editableWeight && validationResult.value) {
        this.currentWeightValue = validationResult.value;
        this.stateService.changeEdgeWeight({weight: this.editableWeight,
          changeValue: validationResult.value});
      }
    } else {
      // Handle invalid input (e.g., reset to previous valid value)
      inputElement.value = this.beforeWeightValue;
      // Show warning to user
      this.showValidationWarning(validationResult.message);
    }
    this.hideInput();
  }

  /**
   * Validate potential weight value.
   */
  private validateInput(value: string): WeightValidationResult {
    // Check if the value is a valid number
    const number = Number(value);
    const validNumber = !isNaN(number);
    if (!validNumber) {
      return {valid: false, message: 'Input value is not a number.'};
    }

    if (number < ConfService.MIN_WEIGHT || number > ConfService.MAX_WEIGHT) {
      return {valid: false,
        message: `Input value is out of range. Must be between ${ConfService.MIN_WEIGHT} and ${ConfService.MAX_WEIGHT}.`};
    }

    return {valid: true, message: '', value: number};
  }

  adjustWidth() {
    const inputElement = this.floatingInput.nativeElement;
    const mirrorSpan = this.mirrorSpan.nativeElement;
    mirrorSpan.textContent = inputElement.value || this.currentWeightValue || '';
    const newWidth = mirrorSpan.offsetWidth + 5; // Add some padding
    this.renderer.setStyle(inputElement, 'width', `${newWidth}px`);
  }

  @HostListener('document:touchstart', ['$event'])
  handleTouch(event: TouchEvent) {
    this.handleBlurEvent(event);
  }

  @HostListener('document:wheel', ['$event'])
  handleWheel(event: WheelEvent) {
    // Hide input on wheel event
    this.handleBlurEvent(event);
  }

  private handleBlurEvent(event: Event) {
    const inputContainer = this.floatingInputContainer.nativeElement;
    if (this.isInputVisible && !inputContainer.contains(event.target as Node)) {
      this.hideInput();
    }
  }

  hideInput() {
    const inputContainer = this.floatingInputContainer.nativeElement;
    this.renderer.setStyle(inputContainer, 'display', 'none');
    this.isInputVisible = false;
  }

  showValidationWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Invalid weight value', detail: message, life: 5000});
  }

  private calculateFontSize(): number {
    const minSize = this.editableWeight ? this.editableWeight.weightStyle.text.size : 16;
    const maxSize = 56;
    const zoomScale = this.pixiService.getZoomScale() + 0.1;
    const fontSize = Math.max(minSize, Math.min(maxSize, Math.round(minSize * zoomScale)));
    return fontSize;
  }
}

export interface WeightValidationResult {
  valid: boolean;
  message: string;
  value?: number;
}
