import {
  CELL_HEIGHT,
  CELL_WIDTH,
  cellStyle,
  getVisibleRange,
} from "../utils/utils.js";

export class CellData {
  constructor() {
    this.data = {};
  }

  /**
   * Render visible cells
   * @param {CanvasRenderingContext2D} ctx
   * @param {{
   *   scrollLeft: number,
   *   scrollTop: number,
   *   startCol: number,
   *   endCol: number,
   *   startRow: number,
   *   endRow: number,
   * }} range
   */
  render(ctx, range) {
    const { scrollLeft, scrollTop, startCol, endCol, startRow, endRow } = range;

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const key = `${row}:${col}`;
        const cell = this.data[key];

        if (!cell) continue;

        const { value, bold, italic } = cell;
        cellStyle(ctx, 14, "Arial", "left", "middle", "#111", bold, italic);

        const x = col * CELL_WIDTH - scrollLeft + 2;
        const y = row * CELL_HEIGHT - scrollTop + CELL_HEIGHT / 2 + 2;
        ctx.fillText(value, x, y);
      }
    }
  }

  /**
   * Set data at a specific cell
   * @param {number} row
   * @param {number} col
   * @param {string} value
   * @param {{ bold?: boolean, italic?: boolean }} style
   */
  setCellData(row, col, value, style = {}) {
    const key = `${row}:${col}`;
    this.data[key] = { value, ...style };
  }

  /**
   * Get data of a cell
   * @param {number} row
   * @param {number} col
   * @returns {object|null}
   */
  getCellData(row, col) {
    return this.data[`${row}:${col}`] || null;
  }

  generateDummyData() {
    this.setCellData(10, 3, "HELLO");
    this.setCellData(1, 5, "123", { bold: true, italic: true });
    this.setCellData(5, 2, "Vrutik", { italic: true });
    this.setCellData(15, 8, "Savla", { bold: true });
  }
}
