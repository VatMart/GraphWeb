import {NodeView} from "./graphical-model/node/node-view";

/**
 * Internal grid for fast neighbor search.
 */
export class InternalGrid<T extends NodeView> {
  private cells: Map<string, Set<NodeView>>;
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  private getCellKey(x: number, y: number): string {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return `${col}:${row}`;
  }

  /**
   * Add node to the grid.
   */
  public addNode(node: NodeView, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)?.add(node);
    //console.log('coordinates: ', x, y); // TODO remove
    //console.log('Added node to cell: ', key, (node as ForceNodeView).node.getIndex()); // TODO remove
  }

  /**
   * Remove node from the grid.
   */
  public removeNode(node: T, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    if (this.cells.has(key)) {
      this.cells.get(key)?.delete(node);
      if (this.cells.get(key)?.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  /**
   * Update node position in the grid.
   */
  public updateNode(node: T, oldX: number, oldY: number, newX: number, newY: number): void {
    const oldKey = this.getCellKey(oldX, oldY);
    const newKey = this.getCellKey(newX, newY);
    if (oldKey !== newKey) {
      this.removeNodeFromCell(node, oldKey);
      this.addNode(node, newX, newY);
    }
  }

  private removeNodeFromCell(nodeView: NodeView, key: string): void {
    if (this.cells.has(key)) {
      this.cells.get(key)?.delete(nodeView);
      if (this.cells.get(key)?.size === 0) {
        this.cells.delete(key);
      }
    }
  }

  /**
   * Clear the grid.
   */
  public clear(): void {
    this.cells.clear();
  }

  /**
   * Get neighbors of the node.
   */
  public getNeighbors(node: T, x: number, y: number, range: number = 1): Set<NodeView> {
    const neighbors = new Set<NodeView>();
    const cellKey = this.getCellKey(x, y);
    const [col, row] = cellKey.split(':').map(Number);

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const neighborKey = `${col + dx}:${row + dy}`;
        if (this.cells.has(neighborKey)) {
          this.cells.get(neighborKey)?.forEach(neighbor => {
            if (neighbor !== node) {
              neighbors.add(neighbor);
            }
          });
        }
      }
    }
    // console.log(neighbors); // TODO remove
    return neighbors;
  }

  /**
   * Get neighbors of a point.
   * @param x The x coordinate of the point.
   * @param y The y coordinate of the point.
   * @param range How many cells around the current cell to check (default is 1).
   */
  public getNeighborsOfPoint(x: number, y: number, range: number = 1): Set<NodeView> {
    const neighbors = new Set<NodeView>();
    const cellKey = this.getCellKey(x, y);
    // console.log('Cell key: ', cellKey); // TODO remove
    const [col, row] = cellKey.split(':').map(Number);

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const neighborKey = `${col + dx}:${row + dy}`;
        if (this.cells.has(neighborKey)) {
          this.cells.get(neighborKey)?.forEach(neighbor => {
            neighbors.add(neighbor);
          });
        }
      }
    }
    return neighbors;
  }
}
