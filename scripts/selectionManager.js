export class SelectionManager {
  /**
   * Represents the full grid rendered on canvas.
   * @param {class} grid - Grid class
   */
  constructor(grid) {
    /** @type {grid} */
    this.grid = grid;

    this.selectedCell = null;
  }

  renderSelection(ctx, scrollLeft, scrollTop, cellWidth, cellHeight) {
    if (!this.selectedCell) return;

    const dpr = window.devicePixelRatio || 1;

    const { row, col } = this.selectedCell;
    const x = col * cellWidth - scrollLeft;
    const y = row * cellHeight - scrollTop;

    ctx.save();
    ctx.strokeStyle = "#008000";
    ctx.lineWidth = 2 / dpr;
    ctx.strokeRect(x + 1, y + 1, cellWidth - 1, cellHeight - 1);
    ctx.restore();
  }

  /**
   * Sets selected cell to seleted object
   */
  setSelectedCell(row, col) {
    this.selectedCell = { row, col };
    this.grid.render();
  }

  /**
   * Gets selected cell
   */
  getSelectedCell() {
    return this.selectedCell;
  }
}
