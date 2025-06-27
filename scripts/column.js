export class Column {
  /**
   * Represents a single column in the grid
   * @param {number} index - Column index.
   * @param {number} width - Width of the column
   */
  constructor(index, width) {
    /**@type {number} */
    this.index = index;
    /**@type {number} */
    this.width = width;
  }
}
