import {Injectable} from '@angular/core';
import {GraphViewProperties} from "../model/graphical-model/graph/graph-view-properties";
import {GraphView} from "../model/graphical-model/graph/graph-view";
import {ConfService} from "./config/conf.service";
import {GraphViewService} from "./graph/graph-view.service";
import {DefaultRadius} from "../model/graphical-model/node/radius";

/**
 * Service for managing operations with files.
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private graphService: GraphViewService) {
  }

  /**
   * Serialize the current graph and settings to a JSON string.
   */
  public serializeCurrentGraphAndSettings(): string {
    const graphProperties = ConfService.CURRENT_GRAPH_PROPERTIES;
    const graphView = this.graphService.currentGraphView.toJSON();
    return JSON.stringify({graph: graphView, graphProperties: graphProperties});
  }

  /**
   * Deserialize the graph and settings from the JSON string.
   */
  public deserializeGraphAndSettings(jsonContent: string): AppData {
    // TODO: Add validation of JSON content
    const json = JSON.parse(jsonContent);
    const graphView = GraphView.fromJSON(json.graph);
    const graphProperties = json.graphProperties;
    const radiusValue = graphProperties.graphStyle.nodeStyle.radius.value
    graphProperties.graphStyle.nodeStyle.radius = new DefaultRadius(radiusValue);
    return {graph: graphView, graphProperties: graphProperties};
  }
}

/**
 * Application data.
 */
export interface AppData {
    graph: GraphView;
    graphProperties: GraphViewProperties;
}
