import {Injectable} from '@angular/core';
import {ExportAsPngRequest} from "../component/dialog/export-as-png-dialog/export-as-png-dialog.component";
import {PixiService} from "./pixi.service";
import {Container, Graphics, RenderTexture, Sprite} from "pixi.js";
import {StateService} from "./event/state.service";

/**
 * Service for handling the export of the graph.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private pixiService: PixiService,
              private stateService: StateService) {
  }

  /**
   * Export the graph as PNG.
   */
  exportAsPng(value: ExportAsPngRequest) {
    // 1. Save the current transformation state
    const showVisualGrid = this.pixiService.canvasVisualGrid.renderable;
    this.pixiService.canvasVisualGrid.renderable = false; // Hide visual grid for export
    this.pixiService.canvasVisualGrid.visible = false;
    const graphContainer = this.pixiService.mainContainer;
    const oldPosition = graphContainer.position.clone();
    const oldScale = graphContainer.scale.clone();

    // 2. Determine bounds of content on pixi stage, and zoom level
    // Set scaling to default first
    graphContainer.scale.set(1, 1);
    const scaleFactor = value.resolutionLevel === 'low' ? 0.5 : value.resolutionLevel === 'medium' ? 1 : 3;
    graphContainer.scale.set(scaleFactor, scaleFactor);
    const bounds = this.pixiService.getContentBounds();

    // 3. Create a temporary render texture
    const renderer = this.pixiService.renderer;
    const renderTexture = RenderTexture.create({
      width: bounds.width,
      height: bounds.height,
      antialias: true,
    });

    // 4. Adjust the container's transformation to align with the bounds
    const offsetX = bounds.x - graphContainer.position.x;
    const offsetY = bounds.y - graphContainer.position.y;
    graphContainer.position.set(-offsetX, -offsetY);

    // 5. Create and render a background rectangle if transparentBackground is false
    const exportContainer = new Container();
    if (!value.transparentBackground) {
      const background = new Graphics();
      background.rect(0, 0, bounds.width, bounds.height)
        .fill(0xFFFFFF); // White color
      exportContainer.addChild(background);
    }
    exportContainer.addChild(graphContainer);

    // 6. Render the graph container to the temporary texture
    renderer.render({container: exportContainer, target: renderTexture, clear: true});
    exportContainer.removeChild(graphContainer);
    this.pixiService.stage.addChild(graphContainer);

    // 7. Restore the original transformation state
    graphContainer.position.copyFrom(oldPosition);
    graphContainer.scale.copyFrom(oldScale);
    this.pixiService.canvasVisualGrid.renderable = showVisualGrid;
    this.pixiService.canvasVisualGrid.visible = showVisualGrid;

    // 8. Extract the image data from the texture
    const canvas = renderer.extract.canvas(renderTexture);

    // 9. Convert the canvas to a PNG data URL
    // @ts-ignore
    const dataUrl = canvas.toDataURL('image/png');

    // 10. Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'graph.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 11. Clean up
    renderTexture.destroy(true);
  }
}

// Helper function for deep cloning display objects
function cloneDisplayObject(displayObject: Sprite | Graphics | Container): Sprite | Graphics | Container {
  if (displayObject instanceof Sprite) {
    const sprite = new Sprite(displayObject.texture);
    sprite.position.copyFrom(displayObject.position);
    sprite.scale.copyFrom(displayObject.scale);
    sprite.pivot.copyFrom(displayObject.pivot);
    sprite.rotation = displayObject.rotation;
    sprite.alpha = displayObject.alpha;
    return sprite;
  } else if (displayObject instanceof Graphics) {
    return displayObject.clone();
  } else if (displayObject instanceof Container) {
    const container = new Container();
    container.position.copyFrom(displayObject.position);
    container.scale.copyFrom(displayObject.scale);
    container.pivot.copyFrom(displayObject.pivot);
    container.rotation = displayObject.rotation;
    container.alpha = displayObject.alpha;
    displayObject.children.forEach(child => {
      container.addChild(cloneDisplayObject(child));
    });
    return container;
  } else {
    console.warn('Unsupported display object type for cloning:', displayObject);
    return displayObject;
  }
}
