import {
  getDpr,
  getInputPosition,
  setInputCellPosition,
} from "../utils/utils.js";

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

    this.startX = 0;
    this.startY = 0;
    this.editingRow = null;
    this.editingCol = null;
    this.anchorRow = null;
    this.anchorCol = null;
    this._handleInputKeyDown = null;

    document.addEventListener("keydown", this._onGlobalKeyDown.bind(this));
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
    console.log("onPointerDown");

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    this.startX = x;
    this.startY = y;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    this.gridCanvas.selectionManager.setAnchorCell(row, col);
    this.gridCanvas.selectionManager.setFocusCell(row, col);

    this.anchorRow = row;
    this.anchorCol = col;

    this._setEditingCell(row, col);
    setInputCellPosition(
      this.container,
      this.cellInput,
      this.columns,
      this.rows,
      row,
      col
    );
    this._displayInput();
    this.cellInput.value = this.cellData.getCellData(row, col)?.value || "";
    this.cellInput.blur();

    this.render();
  }

  onPointerMove(e) {
    console.log("onPointerMove");
    cellInput.style.borderRight = "none";
    cellInput.style.borderBottom = "none";
    this.cellInput.blur();

    const rect = this.gridCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const y = e.clientY - rect.top + this.container.scrollTop;

    const col = this.columns.findColumnAtX(x);
    const row = this.rows.findRowAtY(y);

    this.gridCanvas.selectionManager.setFocusCell(row, col);
    this.render();
  }

  onPointerUp(e) {
    console.log("onPointerUp");

    this.render();
  }

  _onGlobalKeyDown(event) {
    console.log("_onGlobalKeyDown");
    if (this.editingRow == null || this.editingCol == null) return;

    const key = event.key;
    const isArrowOrEnter = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
    ].includes(key);

    if (isArrowOrEnter) {
      console.log("isArrowOrEnter");
      // this._hideInput();
      // const value = this.cellInput.value.trim();
      // this.cellInput.value = value;

      let newRow = this.editingRow;
      let newCol = this.editingCol;
      switch (key) {
        case "Enter":
        case "ArrowDown":
          event.preventDefault();
          newRow = Math.min(this.editingRow + 1, this.rows.totalRows - 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          if (this.editingRow > 0) newRow--;
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (this.editingCol > 0) newCol--;
          break;
        case "ArrowRight":
          event.preventDefault();
          newCol++;
          break;
      }

      this.gridCanvas.selectionManager.setAnchorCell(newRow, newCol);
      this.gridCanvas.selectionManager.setFocusCell(newRow, newCol);
      this._setEditingCell(newRow, newCol);
      setInputCellPosition(
        this.container,
        this.cellInput,
        this.columns,
        this.rows,
        newRow,
        newCol
      );
      this._displayInput();

      this.cellInput.blur();
      this.render();
      return;
    }
  }

  _startEditing(row, col, initialChar = "") {
    console.log("_startEditing");

    const dpr = getDpr();
    this._setEditingCell(row, col);
    setInputCellPosition(
      this.container,
      this.cellInput,
      this.columns,
      this.rows,
      row,
      col
    );
    this._displayInput();
    this.cellInput.value =
      initialChar || this.cellData.getCellData(row, col)?.value || "";

    setTimeout(() => {
      this.cellInput.focus();
    }, 0);

    const finishEdit = () => {
      console.log("finishEdit");
      const value = this.cellInput.value.trim();
      this.cellData.setCellData(row, col, value);
      // this._hideInput();
      this.cellInput.blur();
      this._setEditingCell(null, null);
      this.gridCanvas.selectionManager.setSelectedCell(row, col);
      this.render();
    };

    if (this._handleInputKeyDown) {
      this.cellInput.removeEventListener("keydown", this._handleInputKeyDown);
    }

    this._handleInputKeyDown = (event) => {
      console.log("_handleInputKeyDown");
      const value = this.cellInput.value.trim();
      let newRow = row;
      let newCol = col;

      switch (event.key) {
        case "Enter":
        case "ArrowDown":
          event.preventDefault();
          newRow = Math.min(row + 1, this.rows.totalRows - 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          if (row > 0) newRow = row - 1;
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (col > 0) newCol = col - 1;
          break;
        case "ArrowRight":
          event.preventDefault();
          newCol = col + 1;
          break;
        default:
          return;
      }

      this.cellData.setCellData(row, col, value);
      this.gridCanvas.selectionManager.setAnchorCell(newRow, newCol);
      this.gridCanvas.selectionManager.setFocusCell(newRow, newCol);
      this.render();
      this._startEditing(newRow, newCol);
    };

    this.cellInput.addEventListener("keydown", this._handleInputKeyDown);
    this.cellInput.onblur = finishEdit;
  }

  _setEditingCell(row, col) {
    console.log("_setEditingCell");
    this.editingRow = row;
    this.editingCol = col;
  }

  _hideInput() {
    console.log("_hideInput");
    this.cellInput.style.display = "none";
  }

  _displayInput() {
    console.log("_displayInput");
    this.cellInput.style.display = "block";
  }
}
