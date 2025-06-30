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
   * Renders cell grid
   */
  renderCells() {
    const {
      scrollLeft,
      scrollTop,
      viewWidth,
      viewHeight,
      startCol,
      endCol,
      startRow,
      endRow,
    } = this._getVisibleRange();
    this._setupCanvas(this.ctx, this.canvas, viewWidth, viewHeight);

    this.ctx.save();
    this.ctx.translate(-scrollLeft, -scrollTop);
    this.ctx.beginPath();

    // Horizontal lines
    for (let i = startRow; i <= endRow; i++) {
      const y = i * this.cellHeight + 0.5;
      this.ctx.moveTo(startCol * this.cellWidth, y);
      this.ctx.lineTo(endCol * this.cellWidth, y);
    }

    // Vertical lines
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

  /**
   * Renders column headers
   */
  renderHeader() {
    const { scrollLeft, viewWidth, startCol, endCol } = this._getVisibleRange();
    this._setupCanvas(
      this.ctxHeader,
      this.canvasHeader,
      viewWidth,
      this.cellHeight
    );
    this._headerStyle(this.ctxHeader);

    // Labels
    for (let j = startCol; j < endCol; j++) {
      const x = j * this.cellWidth - scrollLeft;
      const label = this._getColumnLabel(j);
      this.ctxHeader.fillText(
        label,
        x + this.cellWidth / 2,
        this.cellHeight / 2
      );
    }

    // Strokes
    this.ctxHeader.save();
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

  /**
   * Renders row indexes
   */
  renderIndex() {
    const { scrollTop, viewHeight, startRow, endRow } = this._getVisibleRange();
    const indexWidth = 50;
    this._setupCanvas(this.ctxIndex, this.canvasIndex, indexWidth, viewHeight);
    this._headerStyle(this.ctxIndex);

    // Labels
    for (let i = startRow; i < endRow; i++) {
      const y = i * this.cellHeight - scrollTop;
      this.ctxIndex.fillText(i + 1, indexWidth / 2, y + this.cellHeight / 2);
    }

    // Strokes
    this.ctxIndex.save();
    this.ctxIndex.beginPath();
    for (let i = startRow; i <= endRow; i++) {
      const y = i * this.cellHeight - scrollTop + 0.5;
      this.ctxIndex.moveTo(0, y);
      this.ctxIndex.lineTo(indexWidth, y);
    }
    this.ctxIndex.strokeStyle = "#ccc";
    this.ctxIndex.lineWidth = 1;
    this.ctxIndex.stroke();
    this.ctxIndex.restore();
  }

  /**
   * Initialises grid wrapper & rows / column array
   */
  _init() {
    // Set full grid size on wrapper div
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
   * Returns the start/end row/column based on scroll
   */
  _getVisibleRange() {
    const scrollLeft = this.canvasContainer.scrollLeft;
    const scrollTop = this.canvasContainer.scrollTop;
    const viewWidth = this.canvasContainer.clientWidth;
    const viewHeight = this.canvasContainer.clientHeight;

    const startCol = Math.floor(scrollLeft / this.cellWidth);
    const endCol = Math.min(
      this.totalColumns,
      startCol + Math.ceil(viewWidth / this.cellWidth) + 1
    );
    const startRow = Math.floor(scrollTop / this.cellHeight);
    const endRow = Math.min(
      this.totalRows,
      startRow + Math.ceil(viewHeight / this.cellHeight) + 1
    );

    return {
      scrollLeft,
      scrollTop,
      viewWidth,
      viewHeight,
      startCol,
      endCol,
      startRow,
      endRow,
    };
  }

  /**
   * Helper to set up canvas size, DPR scaling, and clear
   */
  _setupCanvas(ctx, canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * Sets styling for column headers & row indexes
   */
  _headerStyle(ctx) {
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111";
  }

  /**
   * Takes index and gives column label (character)
   */
  _getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }
}
