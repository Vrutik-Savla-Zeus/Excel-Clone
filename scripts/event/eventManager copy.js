import { getDpr } from "../utils/utils.js";

/**
 * Manages events (scroll, resize, pointer) for grid interaction,
 * including selection, double-click editing, and drag selection.
 */
export class EventManager {
  constructor({
    container,
    wrapper,
    cellInput,
    render,
    getInputPosition,
    gridCanvas,
    headerCanvas,
    indexCanvas,
    selectAllCanvas,
    cellData,
    columns,
    rows,
  }) {
    // DOM elements and callbacks
    this.container = container;
    this.wrapper = wrapper;
    this.cellInput = cellInput;
    this.render = render;
    this.getInputPosition = getInputPosition;
    this.gridCanvas = gridCanvas;
    this.headerCanvas = headerCanvas;
    this.indexCanvas = indexCanvas;
    this.selectAllCanvas = selectAllCanvas;
    this.cellData = cellData;

    // Editing state
    this.editingRow = null;
    this.editingCol = null;

    // Double-click + drag tracking
    this.isDragging = false;
    this.isEditingAndDragging = false;
    this.dblClickAnchor = null;
    this.awaitingEditFromDblClick = false;

    // For double-click detection
    this.lastClickTime = 0;
    this.lastClickCell = null;

    // For all column and row selection
    this.isColumnSelecting = false;
    this.isRowSelecting = false;
    this.suppressNextClick = false;

    // For column and row resizing
    this.columns = columns;
    this.rows = rows;
    this.edgeThreshold = 3;
    this.colResize = {
      header: null,
      startX: 0,
      startWidth: 0,
    };
    this.rowResize = {
      index: null,
      startY: 0,
      startHeight: 0,
    };

    this._init();
  }

  /** Initializes all core event listeners */
  _init() {
    this._handleScroll();
    this._handleResize();
    this._handleResizeHover();
    this._handleResizeStart();
    this._handleResizeDrag();
    this._handlePointerEvents();
  }

  /** Sets the currently editing cell's coordinates */
  setEditingCell(row, col) {
    this.editingRow = row;
    this.editingCol = col;
  }

  /** Adjusts input position on scroll */
  _handleScroll() {
    this.container.addEventListener("scroll", () => {
      if (
        this.cellInput.style.display === "block" &&
        this.editingRow !== null
      ) {
        const position = this.getInputPosition(
          this.editingRow,
          this.editingCol
        );
        this.cellInput.style.left = `${position.left}px`;
        this.cellInput.style.top = `${position.top}px`;
      }

      requestAnimationFrame(() => this.render());
    });
  }

  /** Rerenders grid on window resize */
  _handleResize() {
    window.addEventListener("resize", () => {
      requestAnimationFrame(() => this.render());
    });
  }

  /**
   * Handles all pointer events:
   * - Single click: selection
   * - Double-click: cell editing
   * - Double-click + drag: selection + editing at anchor cell
   */
  _handlePointerEvents() {
    const gridCanvasEl = document.getElementById("gridCanvas");
    let startX = 0,
      startY = 0,
      hasDragged = false;

    this.container.addEventListener("pointerdown", (e) => {
      hasDragged = false;
      this.isDragging = true;

      const rect = gridCanvasEl.getBoundingClientRect();

      // GUARD CLAUSE: Check if the click was inside the canvas bounds (avoid scrollbar)
      const canvasBounds = gridCanvasEl.getBoundingClientRect();
      const xInCanvas = e.clientX - canvasBounds.left;
      const yInCanvas = e.clientY - canvasBounds.top;
      if (
        xInCanvas < -this.columns.getWidth(0) / 2 ||
        yInCanvas < -this.rows.getHeight(0) ||
        xInCanvas > gridCanvasEl.clientWidth - this.columns.getWidth(0) ||
        yInCanvas > gridCanvasEl.clientHeight - this.rows.getHeight(0)
      ) {
        return;
      }

      const x = e.clientX - rect.left + this.container.scrollLeft;
      const y = e.clientY - rect.top + this.container.scrollTop;

      startX = x;
      startY = y;

      const col = this.columns.findColumnAtX(x);
      const row = this.rows.findRowAtY(y);
      if (col == null && row == null) return;

      // All column selection
      const isHeaderClick = row === null || this.rows.getY(row) > y; // Above first row
      if (isHeaderClick) {
        this.isColumnSelecting = true;
        this.gridCanvas.selectionManager.setAnchorCell(0, col);
        this.gridCanvas.selectionManager.setFocusCell(
          this.rows.totalRows - 1,
          col
        );
        this.render();

        const onMove = (e) => {
          const moveX = e.clientX - rect.left + this.container.scrollLeft;
          const moveCol = this.columns.findColumnAtX(moveX);
          this.gridCanvas.selectionManager.setFocusCell(
            this.rows.totalRows - 1,
            moveCol
          );
          this.render();
        };

        const onUp = (e) => {
          this.isColumnSelecting = false;
          this.suppressNextClick = true; // prevent immediate click reset
          this.container.removeEventListener("pointermove", onMove);
          this.container.removeEventListener("pointerup", onUp);
        };

        this.container.addEventListener("pointermove", onMove);
        this.container.addEventListener("pointerup", onUp);

        return;
      }

      // All row selection
      const isIndexClick = col === null || this.columns.getX(col) > x; // Left of first column
      if (isIndexClick) {
        this.isRowSelecting = true;
        this.gridCanvas.selectionManager.setAnchorCell(row, 0);
        this.gridCanvas.selectionManager.setFocusCell(
          row,
          this.columns.totalColumns - 1
        );
        this.render();

        const onMove = (e) => {
          const moveY = e.clientY - rect.top + this.container.scrollTop;
          const moveRow = this.rows.findRowAtY(moveY);
          this.gridCanvas.selectionManager.setFocusCell(
            moveRow,
            this.columns.totalColumns - 1
          );

          this.render();
        };

        const onUp = (e) => {
          this.isRowSelecting = false;
          this.suppressNextClick = true;
          this.container.removeEventListener("pointermove", onMove);
          this.container.removeEventListener("pointerup", onUp);
        };

        this.container.addEventListener("pointermove", onMove);
        this.container.addEventListener("pointerup", onUp);

        return;
      }

      // Double-click detection based on time and cell location
      const now = Date.now();
      const isSameCell =
        this.lastClickCell &&
        this.lastClickCell.row === row &&
        this.lastClickCell.col === col;
      const isDoubleClick = isSameCell && now - this.lastClickTime < 300;

      this.lastClickTime = now;
      this.lastClickCell = { row, col };

      this.gridCanvas.selectionManager.setAnchorCell(row, col);
      this.gridCanvas.selectionManager.setFocusCell(row, col);
      this.render();

      if (isDoubleClick) {
        this.isEditingAndDragging = true;
        this.dblClickAnchor = { row, col };
        this.awaitingEditFromDblClick = true;
      }

      const onMove = (e) => {
        if (!this.isDragging) return;

        const moveX = e.clientX - rect.left + this.container.scrollLeft;
        const moveY = e.clientY - rect.top + this.container.scrollTop;

        const moveCol = this.columns.findColumnAtX(moveX);
        const moveRow = this.rows.findRowAtY(moveY);

        const distX = Math.abs(moveX - startX);
        const distY = Math.abs(moveY - startY);
        if (distX > 3 || distY > 3) hasDragged = true;

        this.gridCanvas.selectionManager.setFocusCell(moveRow, moveCol);
        this.render();
      };

      const onUp = () => {
        // If double-click + drag occurred, enter editing mode on anchor cell
        if (
          this.isEditingAndDragging &&
          this.awaitingEditFromDblClick &&
          this.dblClickAnchor
        ) {
          const { row, col } = this.dblClickAnchor;
          this._startEditing(row, col);
        }

        this.isDragging = false;
        this.isEditingAndDragging = false;
        this.awaitingEditFromDblClick = false;
        // this.dblClickAnchor = null;

        this.render();
        this.container.removeEventListener("pointermove", onMove);
        this.container.removeEventListener("pointerup", onUp);
      };

      this.container.addEventListener("pointermove", onMove);
      this.container.addEventListener("pointerup", onUp);
    });

    this.container.addEventListener("click", (e) => {
      if (
        hasDragged ||
        this.isColumnSelecting ||
        this.isRowSelecting ||
        this.suppressNextClick
      ) {
        e.preventDefault(); // Prevent post-drag click
        this.suppressNextClick = false;
        return;
      }
      const rect = gridCanvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left + this.container.scrollLeft;
      const y = e.clientY - rect.top + this.container.scrollTop;

      const col = this.columns.findColumnAtX(x);
      const row = this.rows.findRowAtY(y);

      this.gridCanvas.selectionManager.setSelectedCell(row, col);
      this.render();
    });
  }

  /**
   * Begins cell editing at given row and col:
   * shows input, sets style, loads value, attaches listeners.
   */
  _startEditing(row, col) {
    const dpr = getDpr();
    this.setEditingCell(row, col);

    const position = this.getInputPosition(row, col);

    this.cellInput.style.display = "block";
    this.cellInput.style.left = `${position.left}px`;
    this.cellInput.style.top = `${position.top}px`;
    this.cellInput.style.width = `${this.columns.getWidth(col)}px`;
    this.cellInput.style.height = `${this.rows.getHeight(row)}px`;
    this.cellInput.style.border = `${2 / dpr}px solid #008000`;
    this.cellInput.value = this.cellData.getCellData(row, col)?.value || "";
    this.cellInput.focus();

    const finishEdit = () => {
      const { row, col } = this.dblClickAnchor;
      if (row == null || col == null) return;

      this.gridCanvas.selectionManager.setSelectedCell(row, col);

      const value = this.cellInput.value.trim();
      this.cellData.setCellData(row, col, value);
      this.cellInput.style.display = "none";
      this.setEditingCell(null, null);
      this.render();
    };

    this.cellInput.onkeydown = (event) => {
      if (event.key === "Enter") finishEdit();
    };

    this.cellInput.onblur = finishEdit;
  }

  _handleResizeHover() {
    this.container.addEventListener("mousemove", (e) => {
      this.wrapper.style.cursor = "cell";

      const headerRect = this.headerCanvas.canvas.getBoundingClientRect();
      const indexRect = this.indexCanvas.canvas.getBoundingClientRect();
      const selectAllRect = this.selectAllCanvas.canvas.getBoundingClientRect();

      const inHeader =
        e.clientX >= headerRect.left + this.edgeThreshold &&
        e.clientX <= headerRect.right &&
        e.clientY >= headerRect.top &&
        e.clientY <= headerRect.bottom;

      const inIndex =
        e.clientX >= indexRect.left &&
        e.clientX <= indexRect.right &&
        e.clientY >= indexRect.top + this.edgeThreshold &&
        e.clientY <= indexRect.bottom;

      const inSelectAll =
        e.clientX >= selectAllRect.left &&
        e.clientX <= selectAllRect.right &&
        e.clientY >= selectAllRect.top &&
        e.clientY <= selectAllRect.bottom;

      // 🟥 Top-left corner: "cell" cursor only
      if (inSelectAll) {
        this.wrapper.style.cursor = "cell";
        return;
      }

      // Header area (horizontal resizing)
      if (inHeader) {
        const x = e.clientX - headerRect.left + this.container.scrollLeft;
        const col = this.columns.findColumnAtX(x);
        const colLeft = this.columns.getX(col);
        const colRight = colLeft + this.columns.getWidth(col);

        if (
          Math.abs(x - colLeft) <= this.edgeThreshold ||
          Math.abs(x - colRight) <= this.edgeThreshold
        ) {
          this.wrapper.style.cursor = "col-resize";
          return;
        }
      }

      // Index area (vertical resizing)
      if (inIndex) {
        const y = e.clientY - indexRect.top + this.container.scrollTop;
        const row = this.rows.findRowAtY(y);
        const rowTop = this.rows.getY(row);
        const rowBottom = rowTop + this.rows.getHeight(row);

        if (
          Math.abs(y - rowTop) <= this.edgeThreshold ||
          Math.abs(y - rowBottom) <= this.edgeThreshold
        ) {
          this.wrapper.style.cursor = "row-resize";
          return;
        }
      }

      // Default fallback
      this.wrapper.style.cursor = "cell";
    });
  }

  _handleResizeStart() {
    this.container.addEventListener("pointerdown", (e) => {
      const headerRect = this.headerCanvas.canvas.getBoundingClientRect();
      const indexRect = this.indexCanvas.canvas.getBoundingClientRect();

      const scrollLeft = this.container.scrollLeft;
      const scrollTop = this.container.scrollTop;

      // Column resize detection
      const xInHeader = e.clientX - headerRect.left;
      const yInHeader = e.clientY - headerRect.top;

      if (
        e.clientY >= headerRect.top &&
        e.clientY <= headerRect.bottom &&
        xInHeader >= 0 &&
        xInHeader <= headerRect.width
      ) {
        const x = xInHeader + scrollLeft;
        const col = this.columns.findColumnAtX(x);
        // if (col === -1 || col === null) return; // Early return on invalid hit

        const colLeft = this.columns.getX(col);
        const colRight = colLeft + this.columns.getWidth(col);

        if (Math.abs(x - colRight) <= this.edgeThreshold) {
          this.colResize = {
            index: col,
            startX: e.clientX,
            startWidth: this.columns.getWidth(col),
          };
        }
      }

      // Row Resize Detection
      const xInIndex = e.clientX - indexRect.left;
      const yInIndex = e.clientY - indexRect.top;

      if (
        e.clientX >= indexRect.left &&
        e.clientX <= indexRect.right &&
        yInIndex >= 0 &&
        yInIndex <= indexRect.height
      ) {
        const y = yInIndex + scrollTop;
        const row = this.rows.findRowAtY(y);
        // if (row === -1 || row == null) return; // Early return on invalid hit

        const rowTop = this.rows.getY(row);
        const rowBottom = rowTop + this.rows.getHeight(row);

        if (Math.abs(y - rowBottom) <= this.edgeThreshold) {
          this.rowResize = {
            index: row,
            startY: e.clientY,
            startHeight: this.rows.getHeight(row),
          };
        }
      }
    });
  }

  _handleResizeDrag() {
    const onMove = (e) => {
      // Column Resizing
      if (this.colResize.index !== null) {
        const dx = e.clientX - this.colResize.startX;
        const newWidth = Math.max(20, this.colResize.startWidth + dx);
        this.columns.resizeColumn(this.colResize.index, newWidth);
        this.render(); // Re-render affected canvas
      }

      // Row Resizing
      if (this.rowResize.index !== null) {
        const dy = e.clientY - this.rowResize.startY;
        const newHeight = Math.max(20, this.rowResize.startHeight + dy);
        this.rows.resizeRow(this.rowResize.index, newHeight);
        this.render(); // Re-render affected canvas
      }
    };

    const onUp = () => {
      this.colResize.index = null;
      this.rowResize.index = null;

      this.container.removeEventListener("pointermove", onMove);
      this.container.removeEventListener("pointerup", onUp);
    };

    this.container.addEventListener("pointermove", onMove);
    this.container.addEventListener("pointerup", onUp);
  }
}
