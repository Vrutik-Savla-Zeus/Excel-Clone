import { CELL_HEIGHT, CELL_WIDTH, getDpr } from "../utils/utils.js";

/**
 * Manages events (scroll, resize, pointer) for grid interaction,
 * including selection, double-click editing, and drag selection.
 */
export class EventManager {
  constructor({
    container,
    cellInput,
    render,
    getInputPosition,
    gridCanvas,
    cellData,
  }) {
    // DOM elements and callbacks
    this.container = container;
    this.cellInput = cellInput;
    this.render = render;
    this.getInputPosition = getInputPosition;
    this.gridCanvas = gridCanvas;
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

    this._init();
  }

  /** Sets the currently editing cell's coordinates */
  setEditingCell(row, col) {
    this.editingRow = row;
    this.editingCol = col;
  }

  /** Initializes all core event listeners */
  _init() {
    this._handleScroll();
    this._handleResize();
    this._handlePointerEvents();
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
      startY = 0;
    let hasDragged = false;

    this.container.addEventListener("pointerdown", (e) => {
      hasDragged = false;
      this.isDragging = true;

      const rect = gridCanvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left + this.container.scrollLeft;
      const y = e.clientY - rect.top + this.container.scrollTop;

      startX = x;
      startY = y;

      const col = Math.floor(x / CELL_WIDTH);
      const row = Math.floor(y / CELL_HEIGHT);

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

        const rect = gridCanvasEl.getBoundingClientRect();
        const x = e.clientX - rect.left + this.container.scrollLeft;
        const y = e.clientY - rect.top + this.container.scrollTop;

        const moveCol = Math.floor(x / CELL_WIDTH);
        const moveRow = Math.floor(y / CELL_HEIGHT);

        const distX = Math.abs(x - startX);
        const distY = Math.abs(y - startY);
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
      if (hasDragged) {
        e.preventDefault(); // Prevent post-drag click
        return;
      }

      const rect = gridCanvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left + this.container.scrollLeft;
      const y = e.clientY - rect.top + this.container.scrollTop;

      const col = Math.floor(x / CELL_WIDTH);
      const row = Math.floor(y / CELL_HEIGHT);

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
    this.cellInput.style.width = `${CELL_WIDTH}px`;
    this.cellInput.style.height = `${CELL_HEIGHT}px`;
    this.cellInput.style.border = `${2 / dpr}px solid #008000`;
    this.cellInput.value = this.cellData.getCellData(row, col)?.value || "";
    this.cellInput.focus();

    const finishEdit = () => {
      const { row, col } = this.dblClickAnchor;
      this.gridCanvas.selectionManager.setSelectedCell(row, col);

      const value = this.cellInput.value.trim();
      this.cellData.setCellData(row, col, value);
      this.cellInput.style.display = "none";
      this.setEditingCell(null, null);
      this.gridCanvas.render();
    };

    this.cellInput.onkeydown = (event) => {
      if (event.key === "Enter") finishEdit();
    };

    this.cellInput.onblur = finishEdit;
  }
}
