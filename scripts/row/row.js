export class Row {
  constructor(totalRows, cellHeight) {
    this.totalRows = totalRows;
    this.heights = new Array(totalRows).fill(cellHeight);
    this.positions = new Array(totalRows + 1).fill(0); // Prefix sum array
    this._recalculatePositions();
  }

  /**
   * Recalculates absolute Y positions for all rows based on heights
   */
  _recalculatePositions() {
    this.positions[0] = 0;
    for (let i = 1; i <= this.totalRows; i++) {
      this.positions[i] = this.positions[i - 1] + this.heights[i - 1];
    }
  }

  /**
   * Returns top Y coordinate of the row
   */
  getY(row) {
    return this.positions[row];
  }

  /**
   * Returns height of the row
   */
  getHeight(row) {
    return this.heights[row];
  }

  /**
   * Returns total height of all rows combined
   */
  getTotalHeight() {
    return this.positions[this.totalRows];
  }

  /**
   * Resizes a specific row and updates position map
   */
  resizeRow(row, newHeight) {
    this.heights[row] = newHeight;
    this._recalculatePositions();
  }

  /**
   * Returns row index for a given Y position
   * Can be optimized with binary search for large datasets
   */
  findRowAtY(y) {
    for (let i = 0; i < this.totalRows; i++) {
      if (y >= this.positions[i] && y < this.positions[i + 1]) {
        return i;
      }
    }
    return -1;
  }
}
