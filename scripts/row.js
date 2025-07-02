export class Row {
  /**
   * Represents a single row in the grid
   * @param {Number} index - Row index.
   * @param {Number} height - Height of the row.
   */
  constructor(index, height) {
    /**@type {Number} */
    this.index = index;
    /**@type {Number} */
    this.height = height;
  }
}
