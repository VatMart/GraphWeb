import {Graph} from "../../model/graph";
import {Node} from "../../model/node";
import {AlgorithmCalculator} from "./algorithm-calculator";
import {EdgeIndex} from "../../model/edge";
import {GraphOrientation} from "../../model/orientation";

/**
 * Dijkstra algorithm calculator.
 * Calculates the shortest path between two nodes using Dijkstra algorithm.
 */
export class DijkstraAlgorithmCalculator extends AlgorithmCalculator {

  private startNode: Node;
  private endNode: Node;

  constructor(private graph: Graph,
              startNode: number,
              endNode: number) {
    super();
    this.startNode = this.graph.getNodes().get(startNode) as Node;
    this.endNode = this.graph.getNodes().get(endNode) as Node;
    if (!this.startNode || !this.endNode) {
      throw new Error('Invalid start or end node index: ' + startNode + ', ' + endNode); // TODO wrap in custom error
    }
  }

  /**
   * Steps:
   * 1. Initialize distances and previous nodes
   */
  calculate(): any {
    // Distance calculates as weight sum from start node to the node
    const distances = new Map<Node, number>();
    const previous = new Map<Node, Node | null>();
    const minHeap = new MinHeap<Node>();
    const visited = new Set<Node>();
    const checkedPaths: any[] = []; // For visualization all checked paths
    distances.set(this.startNode, 0); // Distance from start node to itself is 0
    minHeap.enqueue(this.startNode, 0); // Add start node to the heap

    // Initialize distances and previous nodes
    this.graph.getNodes().forEach(node => {
      if (node !== this.startNode) {
        distances.set(node, Infinity); // Not visited nodes have infinite distance
      }
      previous.set(node, null); // Previous node is not defined yet
    });

    while (minHeap.length > 0) {
      const smallest = minHeap.dequeue();
      if (!smallest) continue;

      // Once a node is dequeued, it means we've found the shortest path to it
      visited.add(smallest);

      // If we reach the end node, we can reconstruct the path
      if (smallest === this.endNode) {
        const path: Node[] = [];
        let currentNode = this.endNode;
        while (currentNode !== null) {
          path.push(currentNode);
          currentNode = previous.get(currentNode) as Node;
        }
        path.reverse();
        return { distance: distances.get(this.endNode),
          path: path.map(node => node.index),
          checkedPaths};
      }

      // Update distances to neighboring nodes
      if (smallest !== undefined) {
        this.graphService.getAdjacentNodes(this.graph, smallest).forEach(neighbor => {
          if (visited.has(neighbor)) return; // Skip already visited nodes

          // Get the correct edge weight considering the graph's orientation
          let edgeWeight: number | undefined;
          if (this.graph.orientation === GraphOrientation.ORIENTED) {
            edgeWeight = this.graph.getEdges().get(EdgeIndex.fromNodes(smallest, neighbor).value)?.weight;
          } else {
            edgeWeight = this.graph.getEdges().get(EdgeIndex.fromNodes(smallest, neighbor).value)?.weight ??
              this.graph.getEdges().get(EdgeIndex.fromNodes(neighbor, smallest).value)?.weight;
          }
          const alt = distances.get(smallest)! + edgeWeight!;
          checkedPaths.push({
            currentNode: smallest.index,
            neighborNode: neighbor.index,
            distance: alt
          });
          if (alt < distances.get(neighbor)!) {
            distances.set(neighbor, alt);
            previous.set(neighbor, smallest);
            minHeap.enqueue(neighbor, alt);
          }
        });
      }
    }
    return { distance: Infinity, path: [], checkedPaths};
  }
}

/**
 * Min heap data structure.
 */
class MinHeap<T> {
  private heap: { value: T, priority: number }[];

  constructor() {
    this.heap = [];
  }

  private swap(index1: number, index2: number) {
    [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
  }

  /**
   * Bubble up the element to the correct position.
   */
  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Bubble down the element to the correct position.
   */
  private bubbleDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];

    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swap = leftChildIndex;
        }
      }
      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild!.priority)
        ) {
          swap = rightChildIndex;
        }
      }
      if (swap === null) break;
      this.swap(index, swap);
      index = swap;
    }
  }

  /**
   * Add element to the heap.
   */
  enqueue(value: T, priority: number): void {
    this.heap.push({ value, priority });
    this.bubbleUp();
  }

  /**
   * Remove and return the element with the smallest priority.
   */
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    this.swap(0, this.heap.length - 1);
    const min = this.heap.pop();
    if (this.heap.length > 0) {
      this.bubbleDown();
    }
    return min?.value;
  }

  get length() {
    return this.heap.length;
  }
}
