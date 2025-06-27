import { Row } from "./row.js";
import { Column } from "./column.js";

export class Grid {
  /**
   * Represents the full grid rendered on canvas.
   * @param {HTMLDivElement} canvasContainer - Scrollable container element.
   * @param {HTMLCanvasElement} canvas -Canvas element to render on.
   * @param {CanvasRenderingContext2D} ctx Canvas 2d rendering context.
   * @param {number} totalRows - Total number of rows.
   * @param {number} totalColumns - Total number of columns.
   * @param {number} cellWidth - Width of each cell.
   * @param {number} cellHeight - Height of each cell.
   */
  constructor(
    canvasContainer,
    canvas,
    ctx,
    totalRows,
    totalColumns,
    cellWidth,
    cellHeight
  ) {
    /** @type {HTMLDivElement} */
    this.canvasContainer = canvasContainer;
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;

    /** @type {number} */
    this.totalRows = totalRows;
    /** @type {number} */
    this.totalColumns = totalColumns;
    /** @type {number} */
    this.cellWidth = cellWidth;
    /** @type {number} */
    this.cellHeight = cellHeight;

    /** @type {Row[]} */
    this.rows = [];
    /** @type {Column[]} */
    this.cols = [];

    this._init();
  }

  /**
   * Sets up canvas dimensions, scales for device pixel ratio, create row/column metadata.
   */
  _init() {
    const dpr = window.devicePixelRatio || 1;

    // Storing viewport size
    this.viewWidth = this.canvasContainer.clientWidth;
    this.viewHeight = this.canvasContainer.clientHeight;

    // Set canvas to screen size (Internal Resolution)
    this.canvas.width = this.viewWidth * dpr;
    this.canvas.height = this.viewHeight * dpr;

    // Set CSS(visual) canvas size
    this.canvas.style.width = `${this.viewWidth}px`;
    this.canvas.style.height = `${this.viewHeight}px`;

    // Scales the canvas coordinate system to match the DPR
    this.ctx.scale(dpr, dpr);

    // Set Grid Size on Wrapper Div
    const wrapper = document.getElementById("canvasWrapper");
    wrapper.style.width = `${this.totalColumns * this.cellWidth}px`;
    wrapper.style.height = `${this.totalRows * this.cellHeight}px`;

    for (let i = 0; i < this.totalRows; i++) {
      this.rows.push(new Row(i, this.cellHeight));
    }
    for (let i = 0; i < this.totalColumns; i++) {
      this.cols.push(new Column(i, this.cellWidth));
    }
  }

  /**
   * Adjusts canvas size on zooming in or out, by calculating DPR too.
   */
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    // Get new viewport size
    this.viewWidth = this.canvasContainer.clientWidth;
    this.viewHeight = this.canvasContainer.clientHeight;

    // Update canvas internal resolution
    this.canvas.width = this.viewWidth * dpr;
    this.canvas.height = this.viewHeight * dpr;

    // Match actual css size
    this.canvas.style.width = `${this.viewWidth}px`;
    this.canvas.style.height = `${this.viewHeight}px`;

    // Reset context and scale
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Renders the grid lines on canvas using stroke().
   */
  render() {
    const scrollLeft = this.canvasContainer.scrollLeft;
    const scrollTop = this.canvasContainer.scrollTop;
    const viewportWidth = this.canvasContainer.clientWidth;
    const viewportHeight = this.canvasContainer.clientHeight;

    // Calculate Visible Cell Range
    const startCol = Math.floor(scrollLeft / this.cellWidth);
    const endCol = Math.min(
      this.totalColumns,
      startCol + Math.ceil(viewportWidth / this.cellWidth) + 1
    );

    const startRow = Math.floor(scrollTop / this.cellHeight);
    const endRow = Math.min(
      this.totalRows,
      startRow + Math.ceil(viewportHeight / this.cellHeight) + 1
    );

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-scrollLeft, -scrollTop);
    this.ctx.beginPath();

    for (let i = startRow; i <= endRow; i++) {
      const y = i * this.cellHeight + 0.5;
      this.ctx.moveTo(startCol * this.cellWidth, y);
      this.ctx.lineTo(endCol * this.cellWidth, y);
    }

    for (let j = startCol; j <= endCol; j++) {
      const x = j * this.cellWidth + 0.5;
      this.ctx.moveTo(x, startRow * this.cellHeight);
      this.ctx.lineTo(x, endRow * this.cellHeight);
    }

    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
