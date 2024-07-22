/**
 * Interface for the algorithm animation resolver.
 */
export interface AlgorithmAnimationResolver {

  prepareView(): void;

  changeSpeed(speed: number): Promise<void>;

  pause(): void;

  play(): Promise<void>;

  stepBackward(): Promise<void>;

  stepForward(): Promise<void>;

  goToStep(value: number): void;
}
