export class Row {
  /**
   * Represents a single row in the grid
   * @param {number} index - Row index.
   * @param {number} height - Height of the row.
   */
  constructor(index, height) {
    /**@type {number} */
    this.index = index;
    /**@type {number} */
    this.height = height;
  }
}
