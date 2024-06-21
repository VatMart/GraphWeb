import {PixiService} from "../../service/pixi.service";
import {EventBusService, HandlerNames} from "../../service/event-bus.service";
import {HistoryService} from "../../service/history.service";
import {GraphViewService} from "../../service/graph-view.service";
import {StateService} from "../../service/state.service";
import {InternalGrid} from "../../model/internal-grid";
import {ForceNodeView} from "../../model/graphical-model/force-node-view";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {NodeEventHandler} from "../handlers/node-event-handler";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {Point} from "../../utils/graphical-utils";

/**
 * Submode of 'Default Mode' for applying forces to the graph elements.
 */
export class ForceMode {
  // Static property to keep track of the mode state (Don't change this property directly,
  // use modeOn() and modeOff() methods)
  public static isActive: boolean;
  private grid: InternalGrid<NodeView>;
  private forceNodes: Map<NodeView, ForceNodeView>;

  // Repulsive force
  private repulsionConstant: number = 5000;
  private maxDistance: number = NodeView.DEFAULT_RADIUS * 6; // Maximum distance to apply repulsive force
  // Center-spring force
  private springForceConstant: number = 1;

  // For debugging
  private lastTime: number = 0;
  private fps: number = 0;

  constructor(private pixiService: PixiService,
              private eventBus: EventBusService,
              private historyService: HistoryService,
              private graphViewService: GraphViewService,
              private stateService: StateService,
              gridCellSize: number) {
    this.grid = new InternalGrid<NodeView>(gridCellSize);
    this.forceNodes = new Map<NodeView, ForceNodeView>();
  }

  modeOn(): void {
    this.initializeForceNodes();
    this.enableForces();
    ForceMode.isActive = true;
  }

  modeOff(): void {
    this.disableForces();
    this.destroyForceNodes();
    ForceMode.isActive = false;
  }

  onAddedNode(nodeView: NodeView): void {
    this.initializeForceNode(nodeView);
  }

  onAddedEdge(edgeView: EdgeView): void {
  }

  onRemovedNode(nodeView: NodeView): void {
    this.destroyForceNode(nodeView);
  }

  onRemovedEdge(edgeView: EdgeView): void {
  }

  onGraphCleared(): void {
  }

  onUndoInvoked(): void {
  }

  onRedoInvoked(): void {
  }

  private enableForces(): void {
    console.log("Forces enabled"); // TODO remove
    // Replace default node dragging to force dragging (should update position of dragged nodes in grid)
    this.eventBus.removeHandler(HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_MOVE, NodeEventHandler.boundForceDragMove)

    this.startUpdateLoop();
  }

  private startUpdateLoop(): void {
    this.pixiService.ticker.add(this.updateForces, this);
    //this.pixiService.ticker.add(this.logFPS, this); // For debugging
  }

  private stopUpdateLoop(): void {
    this.pixiService.ticker.remove(this.updateForces, this);
    //this.pixiService.ticker.remove(this.logFPS, this);
  }

  private updateForces(): void {
    const processedPairs = new Set<string>();
    let totalX = 0;
    let totalY = 0;
    let nodeCount = this.forceNodes.size;
    const draggedNodes = NodeEventHandler.dragTarget?.map(nm => nm.node);
    this.forceNodes.forEach((forceNode) => {
      this.applyRepulsiveForces(forceNode, processedPairs, draggedNodes);
      // Calculate the center of mass
      const center = forceNode.node.centerCoordinates();
      totalX += center.x;
      totalY += center.y;
    });
    const centerOfMass = {
      x: totalX / nodeCount,
      y: totalY / nodeCount
    };
    // Calculate the dynamic equilibrium distance
    const equilibriumDistance = this.calculateEquilibriumDistance(draggedNodes);
    this.applySpringForce(centerOfMass, equilibriumDistance, draggedNodes);
  }

  private calculateEquilibriumDistance(draggedNodes?: NodeView[]): number {
    const totalNodes = draggedNodes ? this.forceNodes.size - draggedNodes.length : this.forceNodes.size;
    const nodeRadius = NodeView.DEFAULT_RADIUS; // Assuming NodeView has a DEFAULT_RADIUS
    const minimumDistance = NodeView.DEFAULT_RADIUS * 4; // Minimum distance between nodes to prevent overlap
    // Calculate the required area for each node including its minimum spacing
    const areaPerNode = (2 * nodeRadius + minimumDistance) ** 2;
    // Calculate the total area needed for all nodes
    const totalArea = areaPerNode * totalNodes;
    // Assuming the nodes are placed in a roughly circular layout, calculate the radius of this circle
    return Math.sqrt(totalArea / Math.PI);
  }

  private disableForces(): void {
    this.stopUpdateLoop();
    console.log("Forces disabled"); // TODO remove
    // Replace force dragging to default node dragging
    this.eventBus.removeHandler(HandlerNames.NODE_DRAG_MOVE);
    this.eventBus.registerHandler(HandlerNames.NODE_DRAG_MOVE, NodeEventHandler.onDragMoveBound)
  }

  private initializeForceNodes() {
    this.graphViewService.nodeViews.forEach(node => {
      this.initializeForceNode(node);
    });
    NodeEventHandler.grid = this.grid;
  }

  private initializeForceNode(node: NodeView) {
    const forceNode = new ForceNodeView(node);
    this.forceNodes.set(node, forceNode);
    const centerCoordinates = node.centerCoordinates();
    this.grid.addNode(forceNode.node, centerCoordinates.x, centerCoordinates.y);
  }

  private destroyForceNodes() {
    this.forceNodes.clear();
    this.grid.clear();
  }

  private destroyForceNode(node: NodeView) {
    this.forceNodes.delete(node);
    const centerCoordinates = node.centerCoordinates();
    this.grid.removeNode(node, centerCoordinates.x, centerCoordinates.y);
  }

  /**
   * Apply repulsive forces between neighboring nodes.
   */
  private applyRepulsiveForces(forceNode: ForceNodeView, processedPairs: Set<string>,
                               draggedNodes?: NodeView[]): void {
    const centerPosition = forceNode.node.centerCoordinates();
    const neighbors = this.grid.getNeighbors(forceNode.node, centerPosition.x, centerPosition.y, 1);
    neighbors.forEach((neighbor) => {
      const forceNeighbor = this.forceNodes.get(neighbor)!;
      const pairKey = this.getPairKey(forceNode.node, neighbor);
      if (!processedPairs.has(pairKey)) {
        this.applyForceBetweenNodes(forceNode, forceNeighbor, draggedNodes);
        processedPairs.add(pairKey);
      }
    });
    // Update node position on canvas
    const newPosition = forceNode.updatePosition();
    const constrainedPosition = this.constrainToBounds(forceNode.node, newPosition);
    this.graphViewService.moveNodeView(forceNode.node, constrainedPosition);
    // Update node position in the grid
    const newCenterPosition = forceNode.node.centerCoordinates();
    this.grid.updateNode(forceNode.node, centerPosition.x, centerPosition.y, newCenterPosition.x, newCenterPosition.y);
  }

  /**
   * Apply spring-like force to all nodes to keep them at an equilibrium distance from the center of mass.
   * TODO: optimize force by placing in same loop as repulsive force (if center of mass is already calculated)
   */
  private applySpringForce(centerOfMass: Point, equilibriumDistance: number, draggedNodes?: NodeView[]): void {
    this.forceNodes.forEach(forceNode => {
      if (draggedNodes && draggedNodes.includes(forceNode.node)) {
        return; // Skip if node is being dragged
      }
      const nodeCenter = forceNode.node.centerCoordinates();
      const dx = centerOfMass.x - nodeCenter.x;
      const dy = centerOfMass.y - nodeCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const boundaryDistance = distance - equilibriumDistance;

      if (boundaryDistance > 0) {
        const forceMagnitude = this.springForceConstant * (1 - Math.exp(-boundaryDistance));
        const fx = (dx / distance) * forceMagnitude;
        const fy = (dy / distance) * forceMagnitude;
        forceNode.applyForce(fx, fy);
      }
    });
  }

  /**
   * Apply repulsive force between two nodes.
   */
  private applyForceBetweenNodes(nodeA: ForceNodeView, nodeB: ForceNodeView, draggedNodes?: NodeView[]): void {
    const posA = nodeA.node.centerCoordinates();
    const posB = nodeB.node.centerCoordinates();
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0 || distance > this.maxDistance) return; // Skip if distance is zero or greater than maxDistance
    const minimumDistance = NodeView.DEFAULT_RADIUS * 2; // Minimum distance to prevent nodes from getting too close
    const clampedDistance = Math.max(distance, minimumDistance);
    const forceMagnitude = this.repulsionConstant / (clampedDistance * clampedDistance); // Adjust the force calculation
    const fx = (dx / clampedDistance) * forceMagnitude;
    const fy = (dy / clampedDistance) * forceMagnitude;

    let applyOnA = true;
    let applyOnB = true;
    // Nodes that are being dragged should not be affected by repulsive forces
    if (draggedNodes) {
      if (draggedNodes.includes(nodeA.node)) {
        applyOnA = false;
      }
      if (draggedNodes.includes(nodeB.node)) {
        applyOnB = false;
      }
    }
    if (applyOnB) nodeB.applyForce(fx, fy);
    if (applyOnA) nodeA.applyForce(-fx, -fy); // Apply equal and opposite force
  }

  /**
   * Constrain node position within the canvas boundaries.
   */
  private constrainToBounds(node: NodeView, position: Point): Point {
    const constrainedX = Math.max(
      this.pixiService.canvasBoundaries.boundaryXMin,
      Math.min(position.x, this.pixiService.canvasBoundaries.boundaryXMax - node.width)
    );
    const constrainedY = Math.max(
      this.pixiService.canvasBoundaries.boundaryYMin,
      Math.min(position.y, this.pixiService.canvasBoundaries.boundaryYMax - node.height)
    );
    return { x: constrainedX, y: constrainedY };
  }

  /**
   * Get unique key for a pair of nodes.
   */
  private getPairKey(nodeA: NodeView, nodeB: NodeView): string {
    const idA = nodeA.getIndex();
    const idB = nodeB.getIndex();
    return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
  }

  // For debugging
  private logFPS(): void {
    const now = performance.now();
    const elapsed = now - this.lastTime;
    this.lastTime = now;
    this.fps = 1000 / elapsed;
    console.log(`FPS: ${this.fps.toFixed(2)}`);
  }
}
