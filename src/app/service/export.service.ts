import { Injectable } from '@angular/core';
import {ExportAsPngRequest} from "../component/dialog/export-as-png-dialog/export-as-png-dialog.component";
import {PixiService} from "./pixi.service";

/**
 * Service for handling the export of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private pixiService: PixiService) { }

  /**
   * Export the graph as PNG.
   */
  exportAsPng(value: ExportAsPngRequest) {
    // 1 Determine bounds of content on canvas
    // TODO
  }
}
