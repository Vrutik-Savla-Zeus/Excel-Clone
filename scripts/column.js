export class Column {
  /**
   * Represents a single column in the grid
   * @param {Number} index - Column index.
   * @param {Number} width - Width of the column
   */
  constructor(index, width) {
    /**@type {Number} */
    this.index = index;
    /**@type {Number} */
    this.width = width;
  }
}
