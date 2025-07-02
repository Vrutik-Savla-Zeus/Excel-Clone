import { Row } from "./row.js";
import { Column } from "./column.js";
import { SelectionManager } from "./selectionManager.js";

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
   * @param {HTMLCanvasElement} canvasTopLeft -Canvas element to render on.
   * @param {CanvasRenderingContext2D} ctxTopLeft Canvas 2d rendering context.
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
    canvasTopLeft,
    ctxTopLeft,
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
    /** @type {HTMLCanvasElement} */
    this.canvasTopLeft = canvasTopLeft;
    /** @type {CanvasRenderingContext2D} */
    this.ctxTopLeft = ctxTopLeft;

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

    this.data = {};

    this.selectionManager = new SelectionManager(this);

    this._init();
  }

  // METHODS
  render() {
    this.renderCells();
    this.renderHeader();
    this.renderIndex();
    this.renderCellData();
  }

  /**
   * Renders cell grid
   */
  renderCells() {
    const dpr = window.devicePixelRatio || 1;
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
      const y = i * this.cellHeight + 0.5 / dpr;
      this.ctx.moveTo(startCol * this.cellWidth, y);
      this.ctx.lineTo(endCol * this.cellWidth, y);
    }
    // Vertical lines
    for (let j = startCol; j <= endCol; j++) {
      const x = j * this.cellWidth + 0.5 / dpr;
      this.ctx.moveTo(x, startRow * this.cellHeight);
      this.ctx.lineTo(x, endRow * this.cellHeight);
    }
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();
    this.ctx.restore();

    // Fixed strokes: top and left border of viewport
    const maxX = this.totalColumns * this.cellWidth;
    const maxY = this.totalRows * this.cellHeight;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(Math.min(viewWidth, maxX), 0);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, Math.min(viewHeight, maxY));
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1 / dpr;
    this.ctx.stroke();

    this.selectionManager.renderSelection(
      this.ctx,
      scrollLeft,
      scrollTop,
      this.cellWidth,
      this.cellHeight
    );
  }

  /**
   * Renders column headers
   */
  renderHeader() {
    const dpr = window.devicePixelRatio || 1;
    const { scrollLeft, viewWidth, startCol, endCol } = this._getVisibleRange();
    this._setupCanvas(
      this.ctxHeader,
      this.canvasHeader,
      viewWidth,
      this.cellHeight
    );

    // Header Color
    this.ctxHeader.fillStyle = "#f3f3f3"; // light grey
    const visibleColsWidth = (endCol - startCol) * this.cellWidth;
    this.ctxHeader.fillRect(0, 0, visibleColsWidth, this.cellHeight);

    // Labels
    this._cellStyle(this.ctxHeader, 12, "Arial", "center", "middle", "#111");
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
      const x = j * this.cellWidth - scrollLeft + 0.5 / dpr;
      this.ctxHeader.moveTo(x, 0);
      this.ctxHeader.lineTo(x, this.cellHeight);
    }
    this.ctxHeader.moveTo(0, 0);
    this.ctxHeader.lineTo(0, this.cellHeight);

    this.ctxHeader.strokeStyle = "#ccc";
    this.ctxHeader.lineWidth = 1 / dpr;
    this.ctxHeader.stroke();
    this.ctxHeader.restore();
  }

  /**
   * Renders row indexes
   */
  renderIndex() {
    const dpr = window.devicePixelRatio || 1;
    const indexWidth = 50;
    const { scrollTop, viewHeight, startRow, endRow } = this._getVisibleRange();
    this._setupCanvas(this.ctxIndex, this.canvasIndex, indexWidth, viewHeight);

    // Index color
    this.ctxIndex.fillStyle = "#f3f3f3"; // light grey
    const visibleRowsHeight = (endRow - startRow) * this.cellHeight;
    this.ctxIndex.fillRect(0, 0, indexWidth, visibleRowsHeight);

    // Labels
    this._cellStyle(this.ctxIndex, 12, "Arial", "center", "middle", "#111");
    for (let i = startRow; i < endRow; i++) {
      const y = i * this.cellHeight - scrollTop;
      this.ctxIndex.fillText(i + 1, indexWidth / 2, y + this.cellHeight / 2);
    }

    // Strokes
    this.ctxIndex.save();
    this.ctxIndex.beginPath();
    for (let i = startRow; i <= endRow; i++) {
      const y = i * this.cellHeight - scrollTop + 0.5 / dpr;
      this.ctxIndex.moveTo(0, y);
      this.ctxIndex.lineTo(indexWidth, y);
    }

    this.ctxIndex.moveTo(0, 0);
    this.ctxIndex.lineTo(indexWidth, 0);

    this.ctxIndex.strokeStyle = "#ccc";
    this.ctxIndex.lineWidth = 1 / dpr;
    this.ctxIndex.stroke();
    this.ctxIndex.restore();
  }

  /**
   * Renders Top Left corner of grid
   */
  renderTopLeft() {
    const dpr = window.devicePixelRatio || 1;
    const width = 50;
    const height = 25;

    this._setupCanvas(this.ctxTopLeft, this.canvasTopLeft, width, height);
    this.ctxTopLeft.fillStyle = "#f3f3f3";
    this.ctxTopLeft.fillRect(0, 0, width, height);

    this.ctxTopLeft.beginPath();
    this.ctxTopLeft.moveTo(45, 5);
    this.ctxTopLeft.lineTo(20, 20);
    this.ctxTopLeft.lineTo(45, 20);
    this.ctxTopLeft.closePath();
    this.ctxTopLeft.fillStyle = "#888";
    this.ctxTopLeft.fill();
  }

  /**
   * Sets cell data in this.data
   */
  setCellData(row, col, value, style = {}) {
    const key = `${row}:${col}`;
    this.data[key] = { value, ...style };
  }

  /**
   * Gets cell data from this.data with respect to row and column
   */
  getCellData(row, col) {
    return this.data[`${row}:${col}`] || null;
  }

  // PRIVATE METHODS
  /**
   * Initialises grid wrapper & rows / column array
   */
  _init() {
    // Set full grid size on wrapper div
    const wrapper = document.getElementById("canvasWrapper");
    wrapper.style.width = `${
      this.totalColumns * this.cellWidth + this.cellWidth / 2
    }px`;
    wrapper.style.height = `${
      this.totalRows * this.cellHeight + this.cellHeight
    }px`;

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
    const viewWidth = this.canvasContainer.clientWidth + 1;
    const viewHeight = this.canvasContainer.clientHeight + 1;

    const startCol = Math.floor(scrollLeft / this.cellWidth);

    const endCol = Math.min(
      this.totalColumns,
      startCol + Math.ceil(viewWidth / this.cellWidth) + 1
    ); // const endCol = Math.min(
    //   this.totalColumns,
    //   Math.ceil((scrollLeft + viewWidth) / this.cellWidth)
    // );
    const startRow = Math.floor(scrollTop / this.cellHeight);
    const endRow = Math.min(
      this.totalRows,
      startRow + Math.ceil(viewHeight / this.cellHeight) + 1
    );
    // const endRow = Math.min(
    //   this.totalRows,
    //   Math.ceil((scrollTop + viewHeight) / this.cellHeight)
    // );

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
   * Renders cell data
   */
  renderCellData() {
    const { scrollLeft, scrollTop, startCol, endCol, startRow, endRow } =
      this._getVisibleRange();

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const key = `${row}:${col}`;
        const cell = this.data[key];
        if (cell) {
          this._cellStyle(this.ctx, 12, "Arial", "left", "middle", "#111");
          const { value, bold, italic } = this.data[key];

          let fontStyle = "";
          if (italic) fontStyle += "italic ";
          if (bold) fontStyle += "bold ";
          this.ctx.font = `${fontStyle}14px Arial`;

          const x = col * this.cellWidth - scrollLeft + 5;
          const y = row * this.cellHeight - scrollTop + this.cellHeight / 2 + 5;
          this.ctx.fillText(value, x, y);
        }
      }
    }
  }

  /**
   * Sets styling for column headers & row indexes
   */
  _cellStyle(ctx, fontSize, fontFamily, textAlign, textBaseline, color) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = color;
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
