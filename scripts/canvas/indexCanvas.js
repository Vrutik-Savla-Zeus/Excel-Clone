import {
  cellStyle,
  getDpr,
  getVisibleRange,
  setupCanvas,
} from "../utils/utils.js";

export class IndexCanvas {
  constructor(container, columns, rows, selectionManager) {
    this.container = container;
    this.columns = columns;
    this.rows = rows;
    this.selectionManager = selectionManager;

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
      this.container,
      this.columns,
      this.rows
    );
    setupCanvas(this.ctx, this.canvas, indexWidth, viewHeight);

    const selectedRange = this.selectionManager.getSelectedRange();

    for (let i = startRow; i < endRow; i++) {
      const y = this.rows.getY(i) - scrollTop;
      const height = this.rows.getHeight(i);
      const isSelected =
        selectedRange &&
        i >= selectedRange.startRow &&
        i <= selectedRange.endRow;

      if (isSelected) {
        this.ctx.fillStyle = "#d1ffd1"; // light green
        this.ctx.fillRect(0, y, indexWidth, height);
      } else {
        this.ctx.fillStyle = "#f3f3f3"; // default
        this.ctx.fillRect(0, y, indexWidth, height);
      }

      // Text
      cellStyle(this.ctx, 12, "Arial", "center", "middle", "#111");
      this.ctx.fillText(i + 1, indexWidth / 2, y + height / 2);

      // Border for selected row
      if (isSelected) {
        this.ctx.beginPath();
        this.ctx.moveTo(indexWidth - 1 / dpr, y);
        this.ctx.lineTo(indexWidth - 1 / dpr, y + height);
        this.ctx.strokeStyle = "#008000";
        this.ctx.lineWidth = 2 / dpr;
        this.ctx.stroke();
      }
    }

    // Highlight Selected indexes
    if (this.selectionManager.isFullRowSelection()) {
      const { startRow, endRow } = this.selectionManager.getSelectedRowsRange();

      for (let row = startRow; row <= endRow; row++) {
        const y = this.rows.getY(row) - scrollTop;
        const height = this.rows.getHeight(row);

        this.ctx.fillStyle = "#007b3e";
        this.ctx.fillRect(0, y, indexWidth, height);

        // Draw index label again
        cellStyle(this.ctx, 12, "Arial", "center", "middle", "#fff", true);
        this.ctx.fillText(row + 1, indexWidth / 2, y + height / 2);
      }
    }

    // Horizontal grid lines
    this.ctx.save();
    this.ctx.beginPath();

    for (let i = startRow; i <= endRow; i++) {
      const y = this.rows.getY(i) - scrollTop + 0.5 / dpr;
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
