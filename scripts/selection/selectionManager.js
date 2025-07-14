import { getDpr } from "../utils/utils.js";

export class SelectionManager {
  constructor(gridCanvas) {
    this.gridCanvas = gridCanvas;

    this.selectedCell = null;
    this.anchorCell = null;
    this.focusCell = null;

    this.isSelecting = false;
  }

  renderSelection(ctx, columns, rows) {
    if (!this.anchorCell || !this.focusCell) return;

    const dpr = getDpr();
    const { startRow, endRow, startCol, endCol } = this.getSelectedRange();

    const borderX = columns.getX(startCol);
    const borderY = rows.getY(startRow);
    const borderW = columns.getX(endCol + 1) - borderX;
    const borderH = rows.getY(endRow + 1) - borderY;

    ctx.save();
    ctx.strokeStyle = "#008000";
    ctx.lineWidth = 2 / dpr;
    ctx.strokeRect(borderX + 1, borderY + 1, borderW - 2, borderH - 2);
    ctx.restore();
  }

  setAnchorCell(row, col) {
    this.anchorCell = { row, col };
    this.focusCell = { row, col };
    this.selectedCell = { row, col };
    this.updateSummary(this.gridCanvas.cellData);
  }

  setFocusCell(row, col) {
    this.focusCell = { row, col };
    this.selectedCell = { row, col };
    this.updateSummary(this.gridCanvas.cellData);
  }

  setSelectedCell(row, col) {
    this.setAnchorCell(row, col); // sets anchor, focus, and selected
    this.updateSummary(this.gridCanvas.cellData);
    this.gridCanvas.render();
  }

  getAnchorCell() {
    return this.anchorCell;
  }

  getSelectedCell() {
    return this.selectedCell;
  }

  getSelectedRange() {
    if (!this.anchorCell || !this.focusCell) return null;

    const startRow = Math.min(this.anchorCell.row, this.focusCell.row);
    const endRow = Math.max(this.anchorCell.row, this.focusCell.row);
    const startCol = Math.min(this.anchorCell.col, this.focusCell.col);
    const endCol = Math.max(this.anchorCell.col, this.focusCell.col);

    return { startRow, endRow, startCol, endCol };
  }

  getSelectedRowsRange() {
    if (!this.isFullRowSelection()) return null;

    const startRow = Math.min(this.anchorCell.row, this.focusCell.row);
    const endRow = Math.max(this.anchorCell.row, this.focusCell.row);
    return { startRow, endRow };
  }

  getSelectedColumnsRange() {
    if (!this.isFullColumnSelection()) return null;

    const startCol = Math.min(this.anchorCell.col, this.focusCell.col);
    const endCol = Math.max(this.anchorCell.col, this.focusCell.col);
    return { startCol, endCol };
  }

  clearSelection() {
    this.anchorCell = null;
    this.focusCell = null;
    this.selectedCell = null;
    this.isSelecting = false;
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

  isFullColumnSelection() {
    const totalRows = this.gridCanvas.rows.heights.length;

    return (
      this.anchorCell &&
      this.focusCell &&
      this.anchorCell.row === 0 &&
      this.focusCell.row === totalRows - 1
    );
  }

  isFullRowSelection() {
    const totalCols = this.gridCanvas.columns.widths.length;

    return (
      this.anchorCell &&
      this.focusCell &&
      this.anchorCell.col === 0 &&
      this.focusCell.col === totalCols - 1
    );
  }

  updateSummary(cellData) {
    const range = this.getSelectedRange();
    if (!range) return;

    const { startRow, endRow, startCol, endCol } = range;

    let values = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = cellData.getCellData(row, col);
        if (cell && cell.value !== "" && !isNaN(cell.value)) {
          values.push(Number(cell.value));
        }
      }
    }

    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = count ? sum / count : 0;
    const min = count ? Math.min(...values) : 0;
    const max = count ? Math.max(...values) : 0;
    console.log(count, sum, avg, min, max);

    document.getElementById("stat-count").textContent = `Count: ${count}`;
    document.getElementById("stat-sum").textContent = `Sum: ${sum}`;
    document.getElementById("stat-avg").textContent = `Avg: ${avg.toFixed(2)}`;
    document.getElementById("stat-min").textContent = `Min: ${min}`;
    document.getElementById("stat-max").textContent = `Max: ${max}`;
  }
}
