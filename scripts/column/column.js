export class Column {
  constructor(totalColumns, cellWidth) {
    this.totalColumns = totalColumns;
    this.widths = new Array(totalColumns).fill(cellWidth);
    this.positions = new Array(totalColumns + 1).fill(0); // Prefix sum array
    this._recalculatePositions();
  }

  /**
   * Recalculates absolute X positions for all columns based on widths
   */
  _recalculatePositions() {
    this.positions[0] = 0;
    for (let i = 1; i <= this.totalColumns; i++) {
      this.positions[i] = this.positions[i - 1] + this.widths[i - 1];
    }
  }

  /**
   * Returns left X coordinate of the column
   */
  getX(col) {
    return this.positions[col];
  }

  /**
   * Returns width of the column
   */
  getWidth(col) {
    return this.widths[col];
  }

  /**
   * Returns total width of all columns combined
   */
  getTotalWidth() {
    return this.positions[this.totalColumns];
  }

  /**
   * Resizes a specific column and updates position map
   */
  resizeColumn(col, newWidth) {
    this.widths[col] = newWidth;
    this._recalculatePositions();
  }

  /**
   * Returns column index for a given X position
   * Can be optimized with binary search for large datasets
   */
  findColumnAtX(x) {
    for (let i = 0; i < this.totalColumns; i++) {
      if (x >= this.positions[i] && x < this.positions[i + 1]) {
        return i;
      }
    }
    return -1;
  }
}
