import {GraphViewGenerator, NodeViewPosition} from "./graph-view-generator";
import {Graph} from "../../model/graph";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {NodeViewFabricService} from "../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/fabric/edge-view-fabric.service";
import {PixiService} from "../../service/pixi.service";
import {Point} from "../../utils/graphical-utils";
import {ConfService} from "../../service/config/conf.service";
import {EdgeIndex} from "../../model/edge";
import {GraphOrientation} from "../../model/orientation";

/**
 * Default graph view generator.
 * Generate graph view elements by using circles to place nodes.
 */
export class DefaultGraphViewGenerator extends GraphViewGenerator {
  constructor(private pixiService: PixiService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService) {
    super();
  }

  generateGraphViewElements(graph: Graph): { nodes: NodeView[]; edges: EdgeView[] } {
    // 1. Calculate nodes positions
    const nodesPositions = this.calculateNodesPositions(graph);
    // 2. Create node views
    const nodeViews: Map<number, NodeView> = new Map(nodesPositions
      .map(nodePosition => [nodePosition.node.index,
        this.nodeFabric.createDefaultNodeViewFromNode(nodePosition.node, nodePosition.position)]));
    // 3. Create edge views
    const edgeViews: EdgeView[] = [];
    graph.getEdges().forEach((value, key) =>  {
      let hasReverseEdge = false; // Flag is needed to generate proper edge view if two nodes have two edges between them
      if (graph.getEdges().has(EdgeIndex.fromString(key).reverse())
        && graph.orientation === GraphOrientation.ORIENTED) { // has reverse edge and graph is oriented
        hasReverseEdge = true;
      }
      const edgeView = this.edgeFabric.createDefaultEdgeViewFromEdge(graph.orientation, value, nodeViews.get(value.firstNode.index)!,
        nodeViews.get(value.secondNode.index)!, hasReverseEdge);
      edgeViews.push(edgeView);
    });

    return {nodes: [...nodeViews.values()], edges: edgeViews};
  }

  /**
   * Calculate positions of nodes in graph view.
   * Position nodes generated in a circles.
   */
  calculateNodesPositions(graph: Graph): NodeViewPosition[] {
    const canvasCenter = this.pixiService.getCenterCanvasPoint();
    // Calculate the maximum radius for the circles
    const canvasRadius = Math.min(this.pixiService.getCanvasBorderWidth(),
      this.pixiService.getCanvasBorderHeight()) / 2 - ConfService.currentNodeStyle.radius.getRadius();

    // Get all nodes from the graph
    const nodes = [...graph.getNodes().values()];
    const totalNodes = nodes.length;

    const positions: NodeViewPosition[] = [];
    let nodeIndex = 0;
    let currentRadius = ConfService.currentNodeStyle.radius.getRadius() + 50; // Initial radius for the first circle
    const minDistance = 100 + ConfService.currentNodeStyle.radius.getRadius()*2; // Minimum distance between nodes

    while (nodeIndex < totalNodes && currentRadius <= canvasRadius) {
      // Calculate the circumference of the current circle
      const circumference = 2 * Math.PI * currentRadius;
      // Calculate the number of nodes that can fit in this circumference
      const nodesInCircle = Math.floor(circumference / minDistance);

      // Calculate the angle step for each node in the circle
      const angleStep = (2 * Math.PI) / nodesInCircle;

      for (let i = 0; i < nodesInCircle && nodeIndex < totalNodes; i++) {
        // Calculate the angle for this node
        const angle = i * angleStep;
        // Determine the position of the node
        const position: Point = {
          x: canvasCenter.x + currentRadius * Math.cos(angle),
          y: canvasCenter.y + currentRadius * Math.sin(angle),
        };
        // Add the node position to the positions array
        positions.push({ node: nodes[nodeIndex], position });
        nodeIndex++;
      }

      // Increase the radius for the next circle
      currentRadius += minDistance;
    }

    // Place remaining nodes randomly within canvas boundaries if any
    const boundaryXMin = this.pixiService.boundaryXMin + this.pixiService.boundaryGap;
    const boundaryXMax = this.pixiService.boundaryXMax - this.pixiService.boundaryGap;
    const boundaryYMin = this.pixiService.boundaryYMin + this.pixiService.boundaryGap;
    const boundaryYMax = this.pixiService.boundaryYMax - this.pixiService.boundaryGap;

    while (nodeIndex < totalNodes) {
      const position: Point = {
        x: boundaryXMin + Math.random() * (boundaryXMax - boundaryXMin),
        y: boundaryYMin + Math.random() * (boundaryYMax - boundaryYMin),
      };
      positions.push({ node: nodes[nodeIndex], position });
      nodeIndex++;
    }

    return positions;
  }
}
