import {
  CELL_HEIGHT,
  cellStyle,
  getDpr,
  getVisibleRange,
  setupCanvas,
} from "../utils/utils.js";

export class IndexCanvas {
  constructor(container) {
    this.container = container;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "index-canvas";
    this.canvas.id = "indexCanvas";
    this.ctx = this.canvas.getContext("2d");

    this._init();
  }

  _init() {
    document.getElementById("canvasWrapper").appendChild(this.canvas);
  }

  /**
   * Renders row indexes
   */
  render() {
    const dpr = getDpr();
    const indexWidth = 50;
    const { scrollTop, viewHeight, startRow, endRow } = getVisibleRange(
      this.container
    );
    setupCanvas(this.ctx, this.canvas, indexWidth, viewHeight);

    // Index color
    this.ctx.fillStyle = "#f3f3f3";
    const visibleRowsHeight = (endRow - startRow) * CELL_HEIGHT;
    this.ctx.fillRect(0, 0, indexWidth, visibleRowsHeight);

    // Index labels
    cellStyle(this.ctx, 12, "Arial", "center", "middle", "#111");
    for (let i = startRow; i < endRow; i++) {
      const y = i * CELL_HEIGHT - scrollTop;
      this.ctx.fillText(i + 1, indexWidth / 2, y + CELL_HEIGHT / 2);
    }

    // Index strokes
    this.ctx.save();
    this.ctx.beginPath();

    for (let i = startRow; i <= endRow; i++) {
      const y = i * CELL_HEIGHT - scrollTop + 0.5 / dpr;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(indexWidth, y);
    }
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(indexWidth, 0);

    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
