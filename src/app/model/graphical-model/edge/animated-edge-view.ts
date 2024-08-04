import {EdgeView} from "./edge-view";
import {Point} from "../../../utils/graphical-utils";
import {Texture, Ticker} from "pixi.js";
import {EdgeOrientation} from "../../orientation";

/**
 * Animated edge view class.
 * Uses for animation of algorithm calculations.
 */
export class AnimatedEdgeView {
  public readonly DEFAULT_SPEED: number = 60; // Default speed is 60 frames per second

  // Since we handle orientation of the edge, there could be two possible start and end coordinates
  private startCoordinates: Point;
  private endCoordinates: Point;
  private animationTicker: Ticker;
  private animationProgress: number = 0;
  private animationDuration: number; // Duration of the animation in frames
  private resolveAnimation: (() => void) | null = null;
  private isAnimating: boolean = false;
  private isReversing: boolean = false; // If animation is reversing

  // State of the edge
  private state: 'default' | 'initial' | 'animate' | 'final' = 'default';
  private beforeAnimationTexture?: Texture;
  private afterAnimationTexture?: Texture;

  constructor(private edgeView: EdgeView,
              private startNodePosition: 1 | 2,
              public color: number,
              private _speed: number = 1) {
    this.animationDuration = this.DEFAULT_SPEED / _speed;
    const positions = edgeView.resolveConnectors(edgeView.startNode, edgeView.endNode);
    this.startCoordinates = startNodePosition === 1 ? positions[0] : positions[1];
    this.endCoordinates = startNodePosition === 1 ? positions[1] : positions[0];
    let offset = {x: 0, y: 0};
    if (this.edgeView.offset && this.edgeView.offset !== 0) { // For two-directional edges
      offset = this.edgeView.getPerpendicularOffset(this.startCoordinates, this.endCoordinates,
        this.edgeView.offset);
      this.startCoordinates.x += offset.x;
      this.startCoordinates.y += offset.y;
      this.endCoordinates.x += offset.x;
      this.endCoordinates.y += offset.y;
    }
    this.animationTicker = Ticker.shared; // ticker with autoStart = true
  }

  /**
   * Start the animation.
   */
  public startAnimation(): Promise<void> {
    if (this.isAnimating) {
      return Promise.resolve();
    }
    this.isAnimating = true;
    this.isReversing = false;
    return new Promise((resolve) => {
      this.resolveAnimation = resolve;
      this.animationTicker.add(this.animateEdge, this);
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
      this.animationTicker.add(this.animateEdge, this);
    });
  }

  /**
   * Stop the animation.
   */
  public stopAnimation() {
    this.animationTicker.remove(this.animateEdge, this);
    if (this.resolveAnimation) {
      this.resolveAnimation();
    }
    this.isAnimating = false;
  }


  /**
   * To default state, when algorithm mode was not active.
   */
  public resetEdge() {
    this.animationProgress = 0;
    this.edgeView.alpha = 1;
    this.edgeView.weightView.texture = this.beforeAnimationTexture!;
    this.edgeView.move();
  }

  /**
   * To initial state of algorithm. Before the animation starts
   */
  public initialState() {
    this.state = 'initial';
    this.animationProgress = 0;
    this.edgeView.weightView.texture = this.beforeAnimationTexture!;
    this.edgeView.alpha = 0.4;
    this.edgeView.move();
  }

  /**
   * To animation state of algorithm. When the animation is in progress.
   * Should be called after the animation starts.
   */
  public animationState() {
    this.state = 'animate';
    this.edgeView.alpha = 1;
    this.edgeView.weightView.texture = this.afterAnimationTexture!;
  }

  /**
   * To final state of algorithm. After the animation ends.
   */
  public finalState() {
    this.state = 'final';
    this.animationProgress = this.animationDuration;
    this.edgeView.alpha = 1;
    this.edgeView.weightView.texture = this.afterAnimationTexture!;
    if (this.startNodePosition === 1) {
      this.edgeView.endCoordinates = this.endCoordinates;
    } else {
      this.edgeView.startCoordinates = this.endCoordinates;
    }
    this.draw(this.edgeView.edgeStyle.strokeWidth);
  }

  /**
   * Initialize textures and graphics for the animation.
   */
  public initTexturesAndGraphics(oldWeightTexture: Texture, newWeightTexture: Texture) {
    this.beforeAnimationTexture = oldWeightTexture;
    this.afterAnimationTexture = newWeightTexture;
    this.initialState()
  }

  private animateEdge() {
    if (!this.isReversing) {
      if (this.animationProgress < this.animationDuration) {
        const t = this.animationProgress / this.animationDuration;
        this.updateEdgePosition(t);
        this.animationProgress++;
      } else {
        this.finalState();
        this.stopAnimation();
      }
    } else { // Reverse animation
      this.animateEdgeReverse();
    }
  }

  private animateEdgeReverse() {
    if (this.animationProgress > 0) {
      const t = this.animationProgress / this.animationDuration;
      this.updateEdgePosition(t);
      this.animationProgress--;
    } else {
      this.initialState();
      this.stopAnimation();
    }
  }

  private updateEdgePosition(t: number) {
    const startX = this.startCoordinates.x;
    const startY = this.startCoordinates.y;
    const endX = this.endCoordinates.x;
    const endY = this.endCoordinates.y;

    const currentX = startX + t * (endX - startX);
    const currentY = startY + t * (endY - startY);

    const widthVariation = t < 0.5 ? t * 4 : (1 - t) * 4; // Grow in the middle of the animation
    const width = this.edgeView.edgeStyle.strokeWidth * (1 + widthVariation);

    if (this.startNodePosition === 1) {
      this.edgeView.endCoordinates = {x: currentX, y: currentY};
    } else {
      this.edgeView.startCoordinates = {x: currentX, y: currentY};
    }
    if (this.state !== 'animate') { // Change texture only if not in animation state
      this.animationState();
    }
    this.draw(width);
  }

  private draw(width: number) {
    this.edgeView.clear();
    // Recalculate endpoint if edge will have arrow first, because it should reset end point coordinates
    let oldEndCoordinates = this.edgeView.endCoordinates;
    if (this.edgeView.edge.orientation === EdgeOrientation.ORIENTED && !this.edgeView.edge.isLoop()) {
      this.edgeView.recalculateEndpointWithArrow();
    }
    if (!this.edgeView.edge.isLoop()) { // Draw straight edge
      this.drawStraightEdge(width);
      oldEndCoordinates = {x: oldEndCoordinates.x, y: oldEndCoordinates.y};
    } // Loop edge not supported for animation for now
    if (this.edgeView.edge.orientation === EdgeOrientation.ORIENTED && !this.edgeView.edge.isLoop()) {
      this.drawArrow(oldEndCoordinates);
    }
    if (this.edgeView.weightVisible) {
      this.edgeView.moveWeight()
    }
  }

  private drawStraightEdge(width: number): void {
    this.edgeView.moveTo(this.edgeView.startCoordinates.x, this.edgeView.startCoordinates.y)
      .lineTo(this.edgeView.endCoordinates.x, this.edgeView.endCoordinates.y)
      .stroke({width: width, color: this.color, cap: 'round'});
  }

  private drawArrow(oldEndCoordinates: Point) {
    if (this.edgeView.arrow) {
      this.edgeView.endCoordinates = this.edgeView.arrow.draw(this.edgeView.startCoordinates, oldEndCoordinates,
        this.color);
    }
  }

  public getEdgeView(): EdgeView {
    return this.edgeView;
  }

  public isAnimationInProgress(): boolean {
    return this.isAnimating;
  }

  public getAnimationProgress(): number {
    return this.animationProgress;
  }

  public setAnimationProgress(progress: number) {
    this.animationProgress = progress;
  }

  public getAnimationDuration(): number {
    return this.animationDuration;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(value: number) {
    this._speed = value;
    this.animationDuration = this.DEFAULT_SPEED / value;
  }
}
