import {
  cellStyle,
  getColumnLabel,
  getDpr,
  getVisibleRange,
  setupCanvas,
} from "../utils/utils.js";

export class HeaderCanvas {
  constructor(container, columns, rows, selectionManager) {
    this.container = container;
    this.columns = columns;
    this.rows = rows;
    this.selectionManager = selectionManager;

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
      this.container,
      this.columns,
      this.rows
    );

    const headerHeight = this.rows.getHeight(0); // Using first row's height as header height
    setupCanvas(this.ctx, this.canvas, viewWidth, headerHeight);

    const selectedRange = this.selectionManager.getSelectedRange();

    for (let j = startCol; j <= endCol; j++) {
      const x = this.columns.getX(j) - scrollLeft;
      const width = this.columns.getWidth(j);
      const isSelected =
        selectedRange &&
        j >= selectedRange.startCol &&
        j <= selectedRange.endCol;

      // Background
      this.ctx.fillStyle = isSelected ? "#d1ffd1" : "#f3f3f3";
      this.ctx.fillRect(x, 0, width, headerHeight);

      // Label
      const label = getColumnLabel(j);
      cellStyle(this.ctx, 12, "Arial", "center", "middle", "#111");
      this.ctx.fillText(label, x + width / 2, headerHeight / 2);

      // Bottom border if selected
      if (isSelected) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, headerHeight - 1 / dpr);
        this.ctx.lineTo(x + width, headerHeight - 1 / dpr);
        this.ctx.strokeStyle = "#008000";
        this.ctx.lineWidth = 2 / dpr;
        this.ctx.stroke();
      }
    }

    // Highlight selected headers
    if (this.selectionManager.isFullColumnSelection()) {
      const { startCol, endCol } =
        this.selectionManager.getSelectedColumnsRange();

      for (let col = startCol; col <= endCol; col++) {
        const x = this.columns.getX(col) - scrollLeft;
        const width = this.columns.getWidth(col);

        this.ctx.fillStyle = "#007b3e"; // dark green
        this.ctx.fillRect(x, 0, width, headerHeight);

        // Draw header label again
        const label = getColumnLabel(col);
        cellStyle(this.ctx, 12, "Arial", "center", "middle", "#fff", true);
        this.ctx.fillText(label, x + width / 2, headerHeight / 2);
      }
    }

    // Header strokes
    this.ctx.save();
    this.ctx.beginPath();

    for (let j = startCol; j <= endCol; j++) {
      const x = this.columns.getX(j) - scrollLeft + 0.5 / dpr;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, headerHeight);
    }
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, headerHeight);

    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
