import { SelectionManager } from "../selection/selectionManager.js";
import { getDpr, getVisibleRange, setupCanvas } from "../utils/utils.js";

export class GridCanvas {
  constructor(container, columns, rows, cellData) {
    this.container = container; // The outer scrollable div

    this.canvas = document.createElement("canvas");
    this.canvas.className = "grid-canvas";
    this.canvas.id = "gridCanvas";
    this.ctx = this.canvas.getContext("2d");

    this.columns = columns;
    this.rows = rows;
    this.cellData = cellData;

    this.selectionManager = new SelectionManager(this);

    this._init();
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
    } = getVisibleRange(this.container, this.columns, this.rows);

    setupCanvas(this.ctx, this.canvas, viewWidth, viewHeight);
    this.ctx.save();
    this.ctx.translate(-scrollLeft, -scrollTop);

    const range = this.selectionManager.getSelectedRange();
    if (range) {
      const { startRow, endRow, startCol, endCol } = range;

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const x = this.columns.getX(col);
          const y = this.rows.getY(row);
          const width = this.columns.getWidth(col);
          const height = this.rows.getHeight(row);

          this.ctx.fillStyle =
            row === this.selectionManager.anchorCell.row &&
            col === this.selectionManager.anchorCell.col
              ? "#fff"
              : "#d1f5d3";
          this.ctx.fillRect(x, y, width, height);
        }
      }
    }

    // Full column selection
    if (this.selectionManager.isFullColumnSelection()) {
      const { startCol, endCol } =
        this.selectionManager.getSelectedColumnsRange();

      for (let col = startCol; col <= endCol; col++) {
        const x = this.columns.getX(col);
        const width = this.columns.getWidth(col);

        for (let row = startRow; row <= endRow; row++) {
          const y = this.rows.getY(row);
          const height = this.rows.getHeight(row);

          this.ctx.fillStyle = "#d1f5d3";
          this.ctx.fillRect(x, y, width, height);
        }
      }
    }

    // Full row selection
    if (this.selectionManager.isFullRowSelection()) {
      const { startRow, endRow } = this.selectionManager.getSelectedRowsRange();

      for (let col = startCol; col <= endCol; col++) {
        const x = this.columns.getX(col);
        const width = this.columns.getWidth(col);

        for (let row = startRow; row <= endRow; row++) {
          const y = this.rows.getY(row);
          const height = this.rows.getHeight(row);

          this.ctx.fillStyle = "#d1f5d3";
          this.ctx.fillRect(x, y, width, height);
        }
      }
    }

    this.ctx.beginPath();

    // Horizontal lines
    for (let i = startRow; i <= endRow; i++) {
      const y = this.rows.getY(i) + 0.5 / dpr;
      const xStart = this.columns.getX(startCol);
      const xEnd = this.columns.getX(endCol + 1);
      this.ctx.moveTo(xStart, y);
      this.ctx.lineTo(xEnd, y);
    }
    // Vertical lines
    for (let j = startCol; j <= endCol; j++) {
      const x = this.columns.getX(j) + 0.5 / dpr;
      const yStart = this.rows.getY(startRow);
      const yEnd = this.rows.getY(endRow + 1);
      this.ctx.moveTo(x, yStart);
      this.ctx.lineTo(x, yEnd);
    }

    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();

    // Cell selection
    this.selectionManager.renderSelection(this.ctx, this.columns, this.rows);

    this.ctx.restore();

    // Fixed strokes: top and left border of viewport

    const maxX = this.columns.getTotalWidth();
    const maxY = this.rows.getTotalHeight();
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(Math.min(viewWidth, maxX), 0);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, Math.min(viewHeight, maxY));
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();

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
