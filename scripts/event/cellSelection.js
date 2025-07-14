import { getDpr } from "../utils/utils.js";

export class CellSelection {
  constructor({
    container,
    wrapper,
    gridCanvas,
    columns,
    rows,
    cellInput,
    render,
    cellData,
  }) {
    this.container = container;
    this.wrapper = wrapper;
    this.gridCanvas = gridCanvas;
    this.columns = columns;
    this.rows = rows;
    this.cellInput = cellInput;
    this.render = render;
    this.cellData = cellData;

    this.isDragging = false;
    this.isEditingAndDragging = false;
    this.dblClickAnchor = null;
    this.awaitingEditFromDblClick = false;
    this.suppressNextClick = false;

    this.startX = 0;
    this.startY = 0;
    this.hasDragged = false;

    this.editingRow = null;
    this.editingCol = null;

    this.lastClickTime = 0;
    this.lastClickCell = null;

    this._bindKeyboardEvents();
    this._inputScroll();
  }

  hitTest(e) {
    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
    const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;
    const isScrollbarClick =
      e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight;

    if (withinX && withinY && !isScrollbarClick) {
      this.wrapper.style.cursor = "cell";
      return true;
    }
    return false;
  }

  onPointerDown(e) {
    this._saveInputValue();

    this.hasDragged = false;
    this.isDragging = true;

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    this.startX = x;
    this.startY = y;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    // Double-click detection
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
    this._startEditing(row, col, false);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    const distX = Math.abs(x - this.startX);
    const distY = Math.abs(y - this.startY);
    if (distX > 3 || distY > 3) this.hasDragged = true;

    this.gridCanvas.selectionManager.setFocusCell(row, col);
    this.render();
  }

  onPointerUp(e) {
    if (
      this.isEditingAndDragging &&
      this.awaitingEditFromDblClick &&
      this.dblClickAnchor
    ) {
      const { row, col } = this.dblClickAnchor;
      this._startEditing(row, col, true);
    }

    this.isDragging = false;
    this.isEditingAndDragging = false;
    this.awaitingEditFromDblClick = false;

    this.render();
  }

  _startEditing(row, col, focus = false) {
    const dpr = getDpr();
    this._setEditingCell(row, col);
    const position = this._getInputPosition();

    this.cellInput.style.display = "block";
    this.cellInput.style.left = `${position.left}px`;
    this.cellInput.style.top = `${position.top}px`;
    this.cellInput.style.width = `${this.columns.getWidth(col)}px`;
    this.cellInput.style.height = `${this.rows.getHeight(row)}px`;
    this.cellInput.style.border = `${2 / dpr}px solid #008000`;
    this.cellInput.value = this.cellData.getCellData(row, col)?.value || "";
    setTimeout(() => {
      focus ? this.cellInput.focus() : this.cellInput.blur();
    }, 1);
  }

  _setEditingCell(row, col) {
    this.editingRow = row;
    this.editingCol = col;
  }

  _getInputPosition() {
    const containerRect = this.container.getBoundingClientRect();
    const left =
      this.columns.getX(this.editingCol) -
      this.container.scrollLeft +
      this.columns.getX(1) / 2 +
      containerRect.left;

    const top =
      this.rows.getY(this.editingRow) -
      this.container.scrollTop +
      this.rows.getY(1) +
      containerRect.top;

    return { left, top };
  }

  _saveInputValue() {
    const row = this.editingRow;
    const col = this.editingCol;

    if (row === null || col === null) return;

    const newValue = this.cellInput.value.trim();
    const existing = this.cellData.getCellData(row, col)?.value || "";

    if (newValue !== existing) {
      this.cellData.setCellData(row, col, newValue);
    }

    // Update selected cell just to be safe
    this.gridCanvas.selectionManager.setSelectedCell(row, col);
    this.render();
  }

  _bindKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      const current = this.gridCanvas.selectionManager.getAnchorCell();
      if (!current) return;

      let { row, col } = current;
      let moved = false;

      const isCharKey =
        e.key?.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

      if (isCharKey) {
        if (document.activeElement === this.cellInput) {
        } else {
          this.cellInput.focus();
          this.cellInput.value = "";
        }
      } else if (e.key === "ArrowUp") {
        this._saveInputValue();
        row = Math.max(0, row - 1);
        moved = true;
      } else if (e.key === "ArrowDown" || e.key === "Enter") {
        this._saveInputValue();
        row = Math.min(this.rows.heights.length - 1, row + 1);
        moved = true;
      } else if (e.key === "ArrowLeft") {
        this._saveInputValue();
        col = Math.max(0, col - 1);
        moved = true;
      } else if (e.key === "ArrowRight") {
        this._saveInputValue();
        col = Math.min(this.columns.widths.length - 1, col + 1);
        moved = true;
      } else if (e.key === "Backspace") {
        if (document.activeElement === this.cellInput) {
        } else {
          this.cellInput.focus();
          this.cellInput.value = "";
        }
      }

      if (moved) {
        e.preventDefault();
        this.gridCanvas.selectionManager.setSelectedCell(row, col);
        this.gridCanvas.selectionManager.setAnchorCell(row, col);
        this.gridCanvas.selectionManager.setFocusCell(row, col);
        this.render();
        this._startEditing(row, col, false);
      }
    });
  }

  _inputScroll() {
    this.container.addEventListener("scroll", () => {
      if (cellInput.style.display === "block" && this.editingRow !== null) {
        const position = this._getInputPosition(
          this.editingRow,
          this.editingCol
        );
        cellInput.style.left = `${position.left}px`;
        cellInput.style.top = `${position.top}px`;
      }
    });
  }
}
