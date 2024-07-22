import { Injectable } from '@angular/core';

/**
 * Service for managing web workers.
 */
@Injectable({
  providedIn: 'root'
})
export class WebWorkerService {
  private workers: { [key: string]: Worker | undefined } = {};

  constructor() {
    if (typeof Worker !== 'undefined') {
      // Initialize workers
      this.workers['algorithm'] = new Worker(new URL('../web-worker/algorithm.worker.ts', import.meta.url), { type: 'module' });
    } else {
      console.error('Web Workers are not supported in this environment.'); //
    }
  }

  /**
   * Sends a message to a worker and returns a promise that resolves with the response.
   * @param workerName The name of the worker to send the message to.
   * @param message The message to send to the worker.
   */
  public sendMessage(workerName: string, message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.workers[workerName];
      if (worker) {
        worker.onmessage = ({ data }) => {
          if (data.type === 'result') {
            resolve(data.result);
          } else if (data.type === 'error') {
            reject(new Error(data.message));
          }
        };
        worker.onerror = (error) => reject(new Error(error.message));
        worker.postMessage(message);
      } else {
        reject(`Worker ${workerName} is not available.`);
      }
    });
  }

  /**
   * Terminates a worker.
   */
  public terminateWorker(workerName: string): void {
    const worker = this.workers[workerName];
    if (worker) {
      worker.terminate();
      this.workers[workerName] = undefined;
    }
  }

  public terminateAllWorkers(): void {
    for (const workerName in this.workers) {
      this.terminateWorker(workerName);
    }
  }
}
