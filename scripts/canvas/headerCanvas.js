import {
  CELL_HEIGHT,
  CELL_WIDTH,
  cellStyle,
  getColumnLabel,
  getDpr,
  getVisibleRange,
  setupCanvas,
} from "../utils/utils.js";

export class HeaderCanvas {
  constructor(container) {
    this.container = container;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "header-canvas";
    this.canvas.id = "headerCanvas";
    this.ctx = this.canvas.getContext("2d");

    this._init();
  }

  _init() {
    document.getElementById("canvasWrapper").appendChild(this.canvas);
  }

  /**
   * Renders column headers
   */
  render() {
    const dpr = getDpr();
    const { scrollLeft, viewWidth, startCol, endCol } = getVisibleRange(
      this.container
    );
    setupCanvas(this.ctx, this.canvas, viewWidth, CELL_HEIGHT);

    // Header background color
    this.ctx.fillStyle = "#f3f3f3"; // light grey
    const visibleColsWidth = (endCol - startCol) * CELL_WIDTH;
    this.ctx.fillRect(0, 0, visibleColsWidth, CELL_HEIGHT);

    // Header labels
    cellStyle(this.ctx, 12, "Arial", "center", "middle", "#111");
    for (let j = startCol; j < endCol; j++) {
      const x = j * CELL_WIDTH - scrollLeft;
      const label = getColumnLabel(j);
      this.ctx.fillText(label, x + CELL_WIDTH / 2, CELL_HEIGHT / 2);
    }

    // Header strokes
    this.ctx.save();
    this.ctx.beginPath();

    for (let j = startCol; j <= endCol; j++) {
      const x = j * CELL_WIDTH - scrollLeft + 0.5 / dpr;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CELL_HEIGHT);
    }
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, CELL_HEIGHT);

    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
