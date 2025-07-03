import { getDpr } from "../utils/utils.js";

export class SelectionManager {
  /**
   * Represents the full grid rendered on canvas.
   * @param {class} grid - Grid class
   */
  constructor(gridCanvas) {
    /** @type {gridCanvas} */
    this.gridCanvas = gridCanvas;

    /** @type {Object} */
    this.selectedCell = null;
  }

  /**
   * Renders cell selection
   * @param {CanvasRenderingContext2D} ctx - Canvas 2d context
   * @param {Number} scrollLeft
   * @param {Number} scrollTop
   * @param {Number} cellWidth
   * @param {Number} cellHeight
   * @returns null
   */
  renderSelection(ctx, scrollLeft, scrollTop, cellWidth, cellHeight) {
    if (!this.selectedCell) return;
    const dpr = getDpr();

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
   * @param {Number} row - Row index
   * @param {Number} col- Column header
   */
  setSelectedCell(row, col) {
    this.selectedCell = { row, col };
    this.gridCanvas.render();
  }

  /**
   * Gets selected cell
   * @returns Object with row and col
   */
  getSelectedCell() {
    return this.selectedCell;
  }
}
