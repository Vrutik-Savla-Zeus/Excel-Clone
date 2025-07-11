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

    this.editingRow = null;
    this.editingCol = null;

    this.isDragging = false;
    this.isEditingAndDragging = false;
    this.awaitingEditFromDblClick = false;
    this.dblClickAnchor = null;
    this.lastClickTime = 0;
    this.lastClickCell = null;
    this.hasDragged = false;
    this.suppressNextClick = false;

    this._setupScrollTracking();
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
    this.hasDragged = false;
    this.isDragging = true;

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

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

    this.startRow = row;
    this.startCol = col;

    if (isDoubleClick) {
      this.isEditingAndDragging = true;
      this.dblClickAnchor = { row, col };
      this.awaitingEditFromDblClick = true;
    } else {
      this._startEditing(row, col, false, true); // blur + overwrite on type
    }

    this.container.addEventListener("click", this._cellSelect);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    if (
      Math.abs(x - this.columns.getX(this.startCol)) > 3 ||
      Math.abs(y - this.rows.getY(this.startRow)) > 3
    ) {
      this.hasDragged = true;
      this.gridCanvas.selectionManager.setFocusCell(row, col);
      this.render();
    }
  }

  onPointerUp(e) {
    this.isDragging = false;

    let row = this.startRow;
    let col = this.startCol;

    if (this.dblClickAnchor && this.awaitingEditFromDblClick) {
      // Double click + drag
      this._startEditing(row, col, true, false); // focused + preserve
    } else if (this.hasDragged) {
      // Single click + drag
      this._startEditing(row, col, false, true); // blur + overwrite
    }

    this.awaitingEditFromDblClick = false;
    this.isEditingAndDragging = false;
    this.dblClickAnchor = null;

    this.container.removeEventListener("click", this._cellSelect);
    this.render();
  }

  _cellSelect = (e) => {
    if (this.hasDragged || this.suppressNextClick) {
      e.preventDefault();
      this.suppressNextClick = false;
      return;
    }

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    this.gridCanvas.selectionManager.setSelectedCell(row, col);
    this.render();
  };

  _startEditing(row, col, focused = false, overwriteOnType = true) {
    this._setEditingCell(row, col);

    // Apply positioning and styling
    this.setInputPosition(focused);

    const currentValue = this.cellData.getCellData(row, col)?.value || "";
    this.cellInput.value = currentValue;
    this.cellInput.readOnly = false;

    if (focused) {
      this.cellInput.focus();
    } else {
      this.cellInput.blur();
    }

    // Typing behavior
    const finishEdit = () => {
      const value = this.cellInput.value.trim();
      this.cellData.setCellData(row, col, value);
      this._setEditingCell(null, null);
      this.gridCanvas.selectionManager.setSelectedCell(row, col);
      this.render();
    };

    // Focus on first key press (if blurred)
    this.cellInput.onkeydown = (event) => {
      if (!focused) {
        this.cellInput.focus();
        if (overwriteOnType) {
          this.cellInput.value = "";
        }
        focused = true;
      }

      if (event.key === "Enter") {
        finishEdit();
      }
    };

    this.cellInput.onblur = () => {
      if (focused) {
        finishEdit();
      }
    };
  }

  _setEditingCell(row, col) {
    this.editingRow = row;
    this.editingCol = col;
  }

  setInputPosition(focused) {
    if (this.editingRow === null || this.editingCol === null) return;

    const dpr = getDpr();
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

    const width = this.columns.getWidth(this.editingCol);
    const height = this.rows.getHeight(this.editingRow);

    this.cellInput.style.left = `${left}px`;
    this.cellInput.style.top = `${top}px`;
    this.cellInput.style.width = `${width}px`;
    this.cellInput.style.height = `${height}px`;
    this.cellInput.style.display = "block";
    this.cellInput.style.border = `${2 / dpr}px solid #008000`;
    focused ? this.cellInput.focus() : this.cellInput.blur();
  }

  _setupScrollTracking() {
    this.container.addEventListener("scroll", () => {
      if (this.editingRow !== null && this.editingCol !== null) {
        this.setInputPosition(document.activeElement === this.cellInput);
      }
    });
  }
}
