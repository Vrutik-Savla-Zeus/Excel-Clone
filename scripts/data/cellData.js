import { CELL_HEIGHT, CELL_WIDTH, cellStyle } from "../utils/utils.js";

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

  async loadFromJSON(jsonArray) {
    const keyArray = Object.keys(jsonArray[0]);
    for (let i = 0; i < keyArray.length; i++) {
      this.setCellData(0, i, keyArray[i]);
    }

    for (let row = 0; row < jsonArray.length; row++) {
      const data = jsonArray[row];

      for (let col = 0; col < keyArray.length; col++) {
        const value = data[keyArray[col]];
        this.setCellData(row + 1, col, value);
      }
    }
  }
}
