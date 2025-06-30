import { Row } from "./row.js";
import { Column } from "./column.js";

export class Grid {
  /**
   * Represents the full grid rendered on canvas.
   * @param {HTMLDivElement} canvasContainer - Scrollable container element.
   * @param {HTMLCanvasElement} canvas -Canvas element to render on.
   * @param {CanvasRenderingContext2D} ctx Canvas 2d rendering context.
   * @param {HTMLCanvasElement} canvasHeader -Canvas element to render on.
   * @param {CanvasRenderingContext2D} ctxHeader Canvas 2d rendering context.
   * @param {HTMLCanvasElement} canvasIndex -Canvas element to render on.
   * @param {CanvasRenderingContext2D} ctxIndex Canvas 2d rendering context.
   * @param {number} totalRows - Total number of rows.
   * @param {number} totalColumns - Total number of columns.
   * @param {number} cellWidth - Width of each cell.
   * @param {number} cellHeight - Height of each cell.
   */
  constructor(
    canvasContainer,
    canvas,
    ctx,
    canvasHeader,
    ctxHeader,
    canvasIndex,
    ctxIndex,
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

    /** @type {HTMLCanvasElement} */
    this.canvasHeader = canvasHeader;
    /** @type {CanvasRenderingContext2D} */
    this.ctxHeader = ctxHeader;
    /** @type {HTMLCanvasElement} */
    this.canvasIndex = canvasIndex;
    /** @type {CanvasRenderingContext2D} */
    this.ctxIndex = ctxIndex;

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
   * Renders the grid lines on canvas using stroke().
   */
  render() {
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

  renderHeader() {
    const dpr = window.devicePixelRatio || 1;

    const scrollLeft = this.canvasContainer.scrollLeft;
    const scrollTop = this.canvasContainer.scrollTop;
    const viewWidth = this.canvasContainer.clientWidth;
    const viewHeight = this.canvasContainer.clientHeight;

    // Column Headers
    this.ctxHeader.canvas.width = viewWidth * dpr;
    this.ctxHeader.canvas.height = this.cellHeight * dpr;
    this.ctxHeader.canvas.style.width = `${viewWidth}px`;
    this.ctxHeader.canvas.style.height = `${this.cellHeight}px`;
    this.ctxHeader.setTransform(1, 0, 0, 1, 0, 0);
    this.ctxHeader.scale(dpr, dpr);
    this.ctxHeader.clearRect(0, 0, viewWidth, this.cellHeight);
    const startCol = Math.floor(scrollLeft / this.cellWidth);
    const endCol = Math.min(
      this.totalColumns,
      startCol + Math.ceil(viewWidth / this.cellWidth) + 1
    );

    this.ctxHeader.font = "12px Arial";
    this.ctxHeader.textAlign = "center";
    this.ctxHeader.textBaseline = "middle";
    this.ctxHeader.fillStyle = "#111";

    for (let j = startCol; j < endCol; j++) {
      const x = j * this.cellWidth - scrollLeft;
      const label = this._getColumnLabel(j);
      this.ctxHeader.fillText(
        label,
        x + this.cellWidth / 2,
        this.cellHeight / 2
      );
    }

    this.ctxHeader.beginPath();
    for (let j = startCol; j <= endCol; j++) {
      const x = j * this.cellWidth - scrollLeft + 0.5;
      this.ctxHeader.moveTo(x, 0);
      this.ctxHeader.lineTo(x, this.cellHeight);
    }

    this.ctxHeader.strokeStyle = "#ccc";
    this.ctxHeader.lineWidth = 1;
    this.ctxHeader.stroke();
    this.ctxHeader.restore();
  }

  renderIndex() {
    const dpr = window.devicePixelRatio || 1;

    const scrollLeft = this.canvasContainer.scrollLeft;
    const scrollTop = this.canvasContainer.scrollTop;
    const viewWidth = this.canvasContainer.clientWidth;
    const viewHeight = this.canvasContainer.clientHeight;

    // Row Headers
    this.ctxIndex.canvas.width = 50 * dpr;
    this.ctxIndex.canvas.height = viewHeight * dpr;
    this.ctxIndex.canvas.style.width = `50px`;
    this.ctxIndex.canvas.style.height = `${viewHeight}px`;
    this.ctxIndex.setTransform(1, 0, 0, 1, 0, 0);
    this.ctxIndex.scale(dpr, dpr);
    this.ctxIndex.clearRect(0, 0, 50, viewHeight);

    const startRow = Math.floor(scrollTop / this.cellHeight);
    const endRow = Math.min(
      this.totalRows,
      startRow + Math.ceil(viewHeight / this.cellHeight) + 1
    );

    this.ctxIndex.font = "12px Arial";
    this.ctxIndex.textAlign = "center";
    this.ctxIndex.textBaseline = "middle";
    this.ctxIndex.fillStyle = "#111";

    for (let i = startRow; i < endRow; i++) {
      const y = i * this.cellHeight - scrollTop;
      this.ctxIndex.fillText(i + 1, 25, y + this.cellHeight / 2);
    }

    this.ctxIndex.beginPath();
    for (let i = startRow; i <= endRow; i++) {
      const y = i * this.cellHeight - scrollTop + 0.5;
      this.ctxIndex.moveTo(0, y);
      this.ctxIndex.lineTo(100, y);
    }

    this.ctxIndex.strokeStyle = "#ccc";
    this.ctxIndex.lineWidth = 1;
    this.ctxIndex.stroke();
    this.ctxIndex.restore();
  }

  _getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }
}
