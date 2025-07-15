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
    this.anchorRow = row;
    this.anchorCol = col;
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

    const autoScrollMargin = 30; // px near edges to trigger scroll
    const autoScrollSpeed = 10; // px per frame

    if (this.isDragging) {
      const containerRect = this.container.getBoundingClientRect();
      const { clientX, clientY } = e;

      // Directions
      const dx =
        clientX < containerRect.left + autoScrollMargin
          ? -autoScrollSpeed
          : clientX > containerRect.right - autoScrollMargin
          ? autoScrollSpeed
          : 0;

      const dy =
        clientY < containerRect.top + autoScrollMargin
          ? -autoScrollSpeed
          : clientY > containerRect.bottom - autoScrollMargin
          ? autoScrollSpeed
          : 0;

      if (dx !== 0 || dy !== 0) {
        if (!this._autoScrollRAF) {
          const scroll = () => {
            this.container.scrollLeft += dx;
            this.container.scrollTop += dy;

            // re-update selection based on new pointer
            this._updateSelectionFromPointer(clientX, clientY);
            this.render();

            this._autoScrollRAF = requestAnimationFrame(scroll);
          };
          this._autoScrollRAF = requestAnimationFrame(scroll);
        }
      } else {
        cancelAnimationFrame(this._autoScrollRAF);
        this._autoScrollRAF = null;
      }
    }

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

    if (this._autoScrollRAF) {
      cancelAnimationFrame(this._autoScrollRAF);
      this._autoScrollRAF = null;
    }

    this.render();
  }

  _startEditing(row, col, focus = false) {
    const dpr = getDpr();
    this._setEditingCell(row, col);
    const position = this._getInputPosition();

    this.cellInput.style.display = "block";
    this.cellInput.style.left = `${position.left + 1}px`;
    this.cellInput.style.top = `${position.top + 1}px`;
    this.cellInput.style.width = `${this.columns.getWidth(col) - 2}px`;
    this.cellInput.style.height = `${this.rows.getHeight(row) - 2}px`;
    this.cellInput.style.border = `none`;
    this.cellInput.style.border = `${2 / dpr}px solid transparent`;
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
      } else if (e.key === "Escape" && this._autoScrollRAF) {
        cancelAnimationFrame(this._autoScrollRAF);
        this._autoScrollRAF = null;
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

  _updateSelectionFromPointer(clientX, clientY) {
    const x =
      clientX -
      this.container.getBoundingClientRect().left +
      this.container.scrollLeft;
    const y =
      clientY -
      this.container.getBoundingClientRect().top +
      this.container.scrollTop;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    if (row >= 0 && col >= 0) {
      this.gridCanvas.selectionManager.setFocusCell(row, col);
    }
  }
}

/*
- Find row / column manipulation issues and rectify them one by one.
- Understand whole codee.
- Auto scroll issue.
*/
