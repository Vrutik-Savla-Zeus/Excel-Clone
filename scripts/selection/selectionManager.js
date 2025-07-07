import { getDpr, TOTAL_COLUMNS, TOTAL_ROWS } from "../utils/utils.js";

export class SelectionManager {
  constructor(gridCanvas) {
    this.gridCanvas = gridCanvas;

    this.selectedCell = null;
    this.anchorCell = null;
    this.focusCell = null;

    this.isSelecting = false;
  }

  renderSelection(ctx, scrollLeft, scrollTop, cellWidth, cellHeight) {
    if (!this.anchorCell || !this.focusCell) return;

    const dpr = getDpr();
    const { startRow, endRow, startCol, endCol } = this.getSelectedRange();

    // Already inside translate in gridCanvas
    ctx.save();

    const borderX = startCol * cellWidth;
    const borderY = startRow * cellHeight;
    const borderW = (endCol - startCol + 1) * cellWidth;
    const borderH = (endRow - startRow + 1) * cellHeight;

    ctx.strokeStyle = "#008000";
    ctx.lineWidth = 2 / dpr;
    ctx.strokeRect(borderX + 1, borderY + 1, borderW - 2, borderH - 2);

    ctx.restore();
  }

  setAnchorCell(row, col) {
    this.anchorCell = { row, col };
    this.focusCell = { row, col };
    this.selectedCell = { row, col };
  }

  setFocusCell(row, col) {
    this.focusCell = { row, col };
    this.selectedCell = { row, col };
  }

  clearSelection() {
    this.anchorCell = null;
    this.focusCell = null;
    this.selectedCell = null;
    this.isSelecting = false;
  }

  getSelectedRange() {
    if (!this.anchorCell || !this.focusCell) return null;

    const startRow = Math.min(this.anchorCell.row, this.focusCell.row);
    const endRow = Math.max(this.anchorCell.row, this.focusCell.row);
    const startCol = Math.min(this.anchorCell.col, this.focusCell.col);
    const endCol = Math.max(this.anchorCell.col, this.focusCell.col);

    return { startRow, endRow, startCol, endCol };
  }

  isCellInSelection(row, col) {
    const range = this.getSelectedRange();
    if (!range) return false;

    return (
      row >= range.startRow &&
      row <= range.endRow &&
      col >= range.startCol &&
      col <= range.endCol
    );
  }

  setSelectedCell(row, col) {
    this.anchorCell = { row, col };
    this.focusCell = { row, col };
    this.selectedCell = { row, col };
    this.gridCanvas.render();
  }

  getAnchorCell() {
    return this.anchorCell;
  }

  getSelectedCell() {
    return this.selectedCell;
  }

  isFullColumnSelection() {
    return (
      this.anchorCell &&
      this.focusCell &&
      this.anchorCell.row === 0 &&
      this.focusCell.row === TOTAL_ROWS - 1
    );
  }

  getSelectedColumnsRange() {
    if (!this.isFullColumnSelection()) return null;

    const startCol = Math.min(this.anchorCell.col, this.focusCell.col);
    const endCol = Math.max(this.anchorCell.col, this.focusCell.col);
    return { startCol, endCol };
  }

  isFullRowSelection() {
    return (
      this.anchorCell &&
      this.focusCell &&
      this.anchorCell.col === 0 &&
      this.focusCell.col === TOTAL_COLUMNS - 1
    );
  }

  getSelectedRowsRange() {
    if (!this.isFullRowSelection()) return null;

    const startRow = Math.min(this.anchorCell.row, this.focusCell.row);
    const endRow = Math.max(this.anchorCell.row, this.focusCell.row);
    return { startRow, endRow };
  }
}
