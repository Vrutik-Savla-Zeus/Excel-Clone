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
  constructor(container, selectionManager) {
    this.container = container;
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
      this.container
    );
    setupCanvas(this.ctx, this.canvas, viewWidth, CELL_HEIGHT);

    const selectedRange = this.selectionManager.getSelectedRange();

    for (let j = startCol; j < endCol; j++) {
      const x = j * CELL_WIDTH - scrollLeft;
      const isSelected =
        selectedRange &&
        j >= selectedRange.startCol &&
        j <= selectedRange.endCol;

      // Background
      this.ctx.fillStyle = isSelected ? "#d1ffd1" : "#f3f3f3";
      this.ctx.fillRect(x, 0, CELL_WIDTH, CELL_HEIGHT);

      // Label
      const label = getColumnLabel(j);
      cellStyle(this.ctx, 12, "Arial", "center", "middle", "#111");
      this.ctx.fillText(label, x + CELL_WIDTH / 2, CELL_HEIGHT / 2);

      // Bottom border if selected
      if (isSelected) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, CELL_HEIGHT - 1 / dpr);
        this.ctx.lineTo(x + CELL_WIDTH, CELL_HEIGHT - 1 / dpr);
        this.ctx.strokeStyle = "#008000";
        this.ctx.lineWidth = 2 / dpr;
        this.ctx.stroke();
      }
    }

    // ✅ Highlight selected headers
    if (this.selectionManager.isFullColumnSelection()) {
      const { startCol, endCol } =
        this.selectionManager.getSelectedColumnsRange();

      for (let col = startCol; col <= endCol; col++) {
        const x = col * CELL_WIDTH - scrollLeft;
        const y = 0;

        this.ctx.fillStyle = "#007b3e"; // dark green
        this.ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

        // Optional: Draw header label again if needed
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "bold 12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const label = String.fromCharCode(65 + col); // A, B, C...
        this.ctx.fillText(label, x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2);
      }
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
