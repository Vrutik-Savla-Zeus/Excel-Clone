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

    this.lastClickTime = 0;
    this.lastClickCell = null;

    this.inputScroll();
  }

  hitTest(e) {
    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
    const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;

    const isScrollbarClick =
      e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight;
    if (isScrollbarClick) return false;

    if (withinX && withinY) {
      this.wrapper.style.cursor = "cell";
    }
    return withinX && withinY;
  }

  onPointerDown(e) {
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

    this.container.addEventListener("click", this._cellSelect);
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
      this._startEditing(row, col);
    }

    this.isDragging = false;
    this.isEditingAndDragging = false;
    this.awaitingEditFromDblClick = false;

    this.container.removeEventListener("click", this._cellSelect);
    this.render();
  }

  _cellSelect(e) {
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
  }

  _startEditing(row, col) {
    const dpr = getDpr();
    this._setEditingCell(row, col);
    const position = this.getInputPosition();
    // const position = this.getInputPosition(row, col);

    this.cellInput.style.display = "block";
    this.cellInput.style.left = `${position.left}px`;
    this.cellInput.style.top = `${position.top}px`;
    this.cellInput.style.width = `${this.columns.getWidth(col)}px`;
    this.cellInput.style.height = `${this.rows.getHeight(row)}px`;
    this.cellInput.style.border = `${2 / dpr}px solid #008000`;
    this.cellInput.value = this.cellData.getCellData(row, col)?.value || "";
    this.cellInput.focus();

    const finishEdit = () => {
      const value = this.cellInput.value.trim();
      this.cellData.setCellData(row, col, value);
      this.cellInput.style.display = "none";
      this._setEditingCell(null, null);
      this.gridCanvas.selectionManager.setSelectedCell(row, col);
      this.render();
    };

    this.cellInput.onkeydown = (event) => {
      if (event.key === "Enter") finishEdit();
    };
    this.cellInput.onblur = finishEdit;
  }

  _setEditingCell(row, col) {
    this.editingRow = row;
    this.editingCol = col;
  }

  getInputPosition() {
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

  inputScroll() {
    this.container.addEventListener("scroll", () => {
      if (cellInput.style.display === "block" && this.editingRow !== null) {
        const position = this.getInputPosition(
          this.editingRow,
          this.editingCol
        );
        cellInput.style.left = `${position.left}px`;
        cellInput.style.top = `${position.top}px`;
      }
    });
  }
}
