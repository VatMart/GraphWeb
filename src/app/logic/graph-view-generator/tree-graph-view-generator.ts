import {GraphViewGenerator, NodeViewPosition} from "./graph-view-generator";
import {Graph} from "../../model/graph";
import {Node} from "../../model/node";
import {NodeView} from "../../model/graphical-model/node/node-view";
import {EdgeView} from "../../model/graphical-model/edge/edge-view";
import {PixiService} from "../../service/pixi.service";
import {NodeViewFabricService} from "../../service/fabric/node-view-fabric.service";
import {EdgeViewFabricService} from "../../service/fabric/edge-view-fabric.service";
import {ConfService} from "../../service/config/conf.service";
import {Point} from "../../utils/graphical-utils";
import {GraphModelService} from "../../service/graph/graph-model.service";

/**
 * Tree graph view generator.
 * Generate graph view elements for tree graph with considering appropriate position generation for tree graph.
 */
export class TreeGraphViewGenerator extends GraphViewGenerator {

  constructor(private pixiService: PixiService,
              private nodeFabric: NodeViewFabricService,
              private edgeFabric: EdgeViewFabricService,
              private graphService: GraphModelService) {
    super();
  }

  calculateNodesPositions(graph: Graph): NodeViewPosition[] {
    const rootNode = graph.getNodes().get(1)!;
    const canvasCenter = this.pixiService.getCenterCanvasPoint();

    let nodePositions: NodeViewPosition[] = [];
    const levelSeparation = 180; // Radial separation between levels

    // If graph tree is linear (n-ary = 1), place nodes in a spiral
    if (this.isLinearTree(rootNode, graph)) {
      nodePositions = this.placeSpiral(rootNode, graph, 0, nodePositions, canvasCenter);
      return nodePositions;
    }
    // Otherwise, place nodes in a radial layout
    this.placeNode(graph, rootNode, canvasCenter, 0, 0, 2 * Math.PI, nodePositions,
      levelSeparation, canvasCenter);

    return nodePositions;
  }

  private placeNode(graph: Graph, node: Node, position: Point, depth: number, angleOffset: number, angleSpan: number,
                    nodePositions: NodeViewPosition[], levelSeparation: number, canvasCenter: Point) {
    nodePositions.push({node, position});

    const children = this.graphService.getAdjacentNodes(graph, node, false);
    const childCount = children.length;
    if (childCount === 0) return;

    const radius = (depth + 1) * levelSeparation;
    const newAngleSpan = angleSpan / childCount;
    const startAngle = angleOffset - (angleSpan / 2) + (newAngleSpan / 2);

    children.forEach((child, index) => {
      const angle = startAngle + index * newAngleSpan;
      const childPosition: Point = {
        x: canvasCenter.x + radius * Math.cos(angle),
        y: canvasCenter.y + radius * Math.sin(angle)
      };
      this.placeNode(graph, child, childPosition, depth + 1, angle, newAngleSpan, nodePositions, levelSeparation,
        canvasCenter);
    });
  }

  private isLinearTree(node: Node, graph: Graph): boolean {
    while (true) {
      const children = this.graphService.getAdjacentNodes(graph, node, false);
      if (children.length > 1) return false;
      if (children.length === 0) return true;
      node = children[0];
    }
  }

  private placeSpiral(node: Node, graph: Graph, startAngle: number, nodePositions: NodeViewPosition[],
                      canvasCenter: Point) {
    let angle = startAngle;
    const angleStep = Math.PI / 6;
    const radiusStep = 50;
    let radius = ConfService.currentNodeStyle.radius.getRadius() * 2;

    while (node) {
      const position: Point = {
        x: canvasCenter.x + radius * Math.cos(angle),
        y: canvasCenter.y + radius * Math.sin(angle)
      };
      nodePositions.push({node, position});

      const children = this.graphService.getAdjacentNodes(graph, node, false);
      if (children.length === 0) break;

      node = children[0];
      angle += angleStep;
      radius += radiusStep / (2 * Math.PI / angleStep);
    }
    return nodePositions;
  }

  generateGraphViewElements(graph: Graph): { nodes: NodeView[]; edges: EdgeView[] } {
    const nodesPositions = this.calculateNodesPositions(graph);
    const nodeViews: Map<number, NodeView> = new Map(nodesPositions
      .map(nodePosition => [nodePosition.node.index,
        this.nodeFabric.createDefaultNodeViewFromNode(nodePosition.node, nodePosition.position)]));

    const edgeViews: EdgeView[] = [];
    graph.getEdges().forEach((value, key) => {
      const edgeView = this.edgeFabric.createDefaultEdgeViewFromEdge(graph.orientation, value, nodeViews.get(value.firstNode.index)!,
        nodeViews.get(value.secondNode.index)!);
      edgeViews.push(edgeView);
    });

    return {nodes: [...nodeViews.values()], edges: edgeViews};
  }
}
