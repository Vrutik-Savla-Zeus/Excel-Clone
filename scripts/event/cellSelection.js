import { getDpr } from "../utils/utils.js";

export class CellSelection {
  constructor({
    container,
    gridCanvas,
    columns,
    rows,
    cellInput,
    getInputPosition,
    render,
    cellData,
  }) {
    this.container = container;
    this.gridCanvas = gridCanvas;
    this.columns = columns;
    this.rows = rows;
    this.cellInput = cellInput;
    this.getInputPosition = getInputPosition;
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
  }

  hitTest(e) {
    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
    const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;
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

    this.container.addEventListener("click", (e) => {
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
    });
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

    this.render();
  }

  _startEditing(row, col) {
    const dpr = getDpr();
    this._setEditingCell(row, col);
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
}

/*
ISSUE:
- After selecting cell, if I try to so column or row selection then the cell where pointerUp event takes place in row/column selection that cell gets selected as a cell selection.
- On resizing first row, the row above it (which is my header canvas), header canvas gets resize.
- If cursor is row/column resize and I move to gridCanvas then cursor remaings row/column resize instead of cell.
- If I perform any selection and then do scroll event through click (by clicking scrollbars) then cell behind scrollbar gets selected (rather i need persistant of any selection when i perform scroll event through click) 
- Individual header and index also get selected (basically cell selection on header and index) I don't want this to happen. Index and header will be selected as row or column selection only and Not any other selectionlike cell selection alone

You prioritize which issue to fix and we will be solving each issue promptwise and stepwise by debugging
*/

// get cell size from row and column into cellData to trim and make dynamic w.r.t cell size
