import { SelectionManager } from "../selection/selectionManager.js";
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  cellStyle,
  getDpr,
  getVisibleRange,
  setupCanvas,
} from "../utils/utils.js";

export class GridCanvas {
  constructor(container, cellData) {
    this.container = container; // The outer scrollable div

    this.canvas = document.createElement("canvas");
    this.canvas.className = "grid-canvas";
    this.canvas.id = "gridCanvas";
    this.ctx = this.canvas.getContext("2d");

    /** @type {SelectionManager} */
    this.selectionManager = new SelectionManager(this);

    this.cellData = cellData;

    this._init();
    this.cellData.generateDummyData();
    this.render();
  }

  _init() {
    document.getElementById("canvasWrapper").appendChild(this.canvas);
  }

  render() {
    const dpr = getDpr();
    const {
      scrollLeft,
      scrollTop,
      viewWidth,
      viewHeight,
      startCol,
      endCol,
      startRow,
      endRow,
    } = getVisibleRange(this.container);

    setupCanvas(this.ctx, this.canvas, viewWidth, viewHeight);
    this.ctx.save();
    this.ctx.translate(-scrollLeft, -scrollTop);
    this.ctx.beginPath();

    // Horizontal lines
    for (let i = startRow; i <= endRow; i++) {
      const y = i * CELL_HEIGHT + 0.5 / dpr;
      this.ctx.moveTo(startCol * CELL_WIDTH, y);
      this.ctx.lineTo(endCol * CELL_WIDTH, y);
    }
    // Vertical lines
    for (let j = startCol; j <= endCol; j++) {
      const x = j * CELL_WIDTH + 0.5 / dpr;
      this.ctx.moveTo(x, startRow * CELL_HEIGHT);
      this.ctx.lineTo(x, endRow * CELL_HEIGHT);
    }
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();
    this.ctx.restore();

    // Fixed strokes: top and left border of viewport
    const maxX = this.totalColumns * CELL_WIDTH;
    const maxY = this.totalRows * CELL_HEIGHT;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(Math.min(viewWidth, maxX), 0);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, Math.min(viewHeight, maxY));
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();

    // Cell selection
    this.selectionManager.renderSelection(
      this.ctx,
      scrollLeft,
      scrollTop,
      CELL_WIDTH,
      CELL_HEIGHT
    );

    // Cell Data
    this.cellData.render(this.ctx, {
      scrollLeft,
      scrollTop,
      startCol,
      endCol,
      startRow,
      endRow,
    });
  }
}
