import {Graphics, Text, Texture, Ticker} from "pixi.js";
import {NodeView} from "./node-view";

/**
 * Node view for algorithm animation.
 */
export class AnimatedNodeView {
  public readonly DEFAULT_SPEED: number = 20; // Default speed is 60 frames per second

  private animationTicker: Ticker;
  private animationProgress: number = 0;
  private animationDuration: number; // Duration of the animation in frames
  private resolveAnimation: (() => void) | null = null;
  private isAnimating: boolean = false;
  private isReversing: boolean = false; // If animation is reversing

  private originalScale: number;
  private originalPivot: { x: number, y: number };
  private originalPosition: { x: number, y: number };

  // State of the node
  private state: 'default' | 'initial' | 'animate' | 'final' = 'default';
  private _beforeAnimationTexture?: Texture;
  private _afterAnimationTexture?: Texture;
  labelGraphics?: Graphics;
  text?: Text; // Algorithm label graphics representation

  constructor(readonly nodeView: NodeView,
              private _algInitLabel: string | null = null, // Label for the node in the algorithm (before the animation starts)
              private _algFinalLabel: string | null = null, // Label for the node in the algorithm (after the animation ends)
              public color: number,
              private isFinal: boolean = false,
              private _speed: number = 1) {
    this.animationDuration = this.DEFAULT_SPEED / _speed;
    this.animationTicker = Ticker.shared; // ticker with autoStart = true
    this.originalScale = nodeView.scale.x;
    this.originalPivot = { x: nodeView.pivot.x, y: nodeView.pivot.y };
    this.originalPosition = { x: nodeView.x, y: nodeView.y };
  }

  /**
   * Start the animation.
   */
  startAnimation(): Promise<void>  {
    if (this.isAnimating) {
      return Promise.resolve();
    }
    this.isAnimating = true;
    this.isReversing = false;
    return new Promise((resolve) => {
      this.resolveAnimation = resolve;
      this.animationTicker.add(this.animateNode, this);
      this.setPivotToCenter();
    });
  }

  /**
   * Reverse the animation.
   */
  public reverseAnimation(): Promise<void> {
    if (this.isAnimating) {
      return Promise.resolve();
    }
    this.isAnimating = true;
    this.isReversing = true;
    return new Promise((resolve) => {
      this.resolveAnimation = resolve;
      this.animationTicker.add(this.animateNode, this);
    });
  }

  /**
   * Stop the animation.
   */
  public stopAnimation() {
    this.animationTicker.remove(this.animateNode, this);
    if (this.resolveAnimation) {
      this.resolveAnimation();
    }
    this.isAnimating = false;
    this.nodeView.scale.set(this.originalScale);
    this.resetPivot();
  }

  /**
   * To default state, when algorithm mode was not active.
   */
  public resetNode() {
    this.state = 'default';
    this.animationProgress = 0;
    if (!this.isFinal) {
      this.nodeView.scale.set(this.originalScale);
      this.nodeView.texture = this._beforeAnimationTexture!;
    }
    if (this.labelGraphics && this.text) {
      this.nodeView.removeChild(this.labelGraphics!);
      this.labelGraphics.destroy();
      this.text.destroy();
      this.labelGraphics = undefined;
      this.text = undefined;
    }
  }

  /**
   * To initial state of algorithm. Before the animation starts
   */
  public initialState() {
    this.state = 'initial';
    this.animationProgress = 0;
    if (!this.isFinal) {
      this.nodeView.scale.set(this.originalScale);
      this.nodeView.texture = this._beforeAnimationTexture!; // Reset color
    }
    if (this._algInitLabel !== null && this.text) {
      this.text.text = this._algInitLabel;
      this.drawLabel();
    }
  }

  /**
   * To animation state of algorithm. When the animation is in progress.
   * Should be called after the animation starts.
   */
  public animationState() {
    this.state = 'animate';
    if (!this.isFinal) {
      this.nodeView.texture = this._afterAnimationTexture!;
    }
  }

  /**
   * To final state of algorithm. After the animation ends.
   */
  public finalState() {
    if (this.state === 'final') {
      return;
    }
    this.state = 'final';
    this.animationProgress = this.animationDuration;
    if (this._algFinalLabel !== null && this.text) {
      this.text.text = this._algFinalLabel;
      this.drawLabel();
    }
    if (!this.isFinal) {
      this.nodeView.texture = this._afterAnimationTexture!;
    }
  }

  /**
   * Initialize textures and graphics for the animation.
   * Should be called only once before the animation starts.
   */
  public initTexturesAndGraphics(oldTexture: Texture, newTexture: Texture) {
    this._beforeAnimationTexture = oldTexture;
    this._afterAnimationTexture = newTexture;
    if (this._algInitLabel !== null) {
      this.labelGraphics = new Graphics();
      this.nodeView.addChild(this.labelGraphics);
      this.text = new Text({text: this._algInitLabel, style: {fill: 0x000000, fontFamily: 'Inter var',
          fontSize: 20}});
      this.text.anchor.set(0.5, 0.5);
      this.labelGraphics.addChild(this.text);
      this.drawLabel();
      this.labelGraphics.pivot.set(0, 0);
      this.labelGraphics.position.set(this.nodeView.width / 2, this.nodeView.height + 15);
    }
    this.initialState()
  }

  private animateNode() {
    if (!this.isReversing) {
      if (this.animationProgress < this.animationDuration) {
        const t = this.animationProgress / this.animationDuration;
        // Set pivot to the center of the node
        this.updateNodeScale(t);
        this.animationProgress++;
      } else {
        this.finalState();
        this.stopAnimation();
      }
    } else { // Reverse animation
      this.animateNodeReverse();
    }
  }

  private animateNodeReverse() {
    if (this.animationProgress > 0) {
      const t = this.animationProgress / this.animationDuration;
      this.updateNodeScale(t);
      this.animationProgress--;
    } else {
      this.stopAnimation();
      this.initialState();
    }
  }

  private updateNodeScale(t: number) {
    const scaleVariation = t < 0.5 ? t * 2 : (1 - t) * 2; // Grow in the middle of the animation
    const scale = this.originalScale * (1 + scaleVariation);
    this.nodeView.scale.set(scale);
    if (this.state !== 'animate') { // Change texture only if not in animation state
      this.animationState();
    }
  }

  private setPivotToCenter() {
    // Save the original position
    this.originalPosition = { x: this.nodeView.x, y: this.nodeView.y };

    // Set pivot to the center of the node
    this.nodeView.pivot.set(this.nodeView.width / 2, this.nodeView.height / 2);
    // Adjust position to account for pivot change
    this.nodeView.position.set(this.nodeView.x + this.nodeView.width / 2, this.nodeView.y + this.nodeView.height / 2);
  }

  private resetPivot() {
    // Reset pivot to default (top-left corner)
    this.nodeView.pivot.set(this.originalPivot.x, this.originalPivot.y);
    // Revert position to original
    this.nodeView.position.set(this.originalPosition.x, this.originalPosition.y);
  }

  private drawLabel() {
    if (!this.labelGraphics || !this.text) {
      return;
    }
    this.labelGraphics.clear();
    const totalWidth = this.text.width + 10; // padding
    const totalHeight = this.text.height;
    this.labelGraphics.roundRect(-totalWidth / 2, -totalHeight / 2, totalWidth, totalHeight, 5)
      .fill(0xFFFFFF)
      .stroke({width: 2, color: this.color, cap: 'round', join: 'round'});
  }

  public isAnimationInProgress(): boolean {
    return this.isAnimating;
  }

  setAnimationProgress(animationProgress: number) {
    this.animationProgress = animationProgress;
  }

  getAnimationProgress() {
    return this.animationProgress;
  }

  public getAnimationDuration(): number {
    return this.animationDuration;
  }

  get algFinalLabel(): string | null {
    return this._algFinalLabel;
  }

  set algFinalLabel(value: string | null) {
    this._algFinalLabel = value;
  }

  get algInitLabel(): string | null {
    return this._algInitLabel;
  }

  set algInitLabel(value: string | null) {
    this._algInitLabel = value;
  }

  get beforeAnimationTexture(): Texture {
    return <Texture>this._beforeAnimationTexture;
  }

  set beforeAnimationTexture(value: Texture) {
    this._beforeAnimationTexture = value;
  }

  get afterAnimationTexture(): Texture {
    return <Texture>this._afterAnimationTexture;
  }

  set afterAnimationTexture(value: Texture) {
    this._afterAnimationTexture = value;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(value: number) {
    this._speed = value;
    this.animationDuration = this.DEFAULT_SPEED / value;
  }
}
