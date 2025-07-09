export class RowResize {
  constructor({
    container,
    wrapper,
    indexCanvas,
    columns,
    rows,
    render,
    edgeThreshold = 3,
  }) {
    this.container = container;
    this.wrapper = wrapper;
    this.indexCanvas = indexCanvas;
    this.columns = columns;
    this.rows = rows;
    this.render = render;
    this.edgeThreshold = edgeThreshold;

    this.activeRow = null;
    this.startY = 0;
    this.startHeight = 0;
  }

  hitTest(e) {
    const rect = this.indexCanvas.canvas.getBoundingClientRect();

    const withinX =
      e.clientY > rect.top + this.edgeThreshold &&
      e.clientY <= rect.bottom &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right;

    if (!withinX) return false;

    const scrollTop = this.container.scrollTop;
    const y = e.clientY - rect.top + scrollTop;
    const row = this.rows.findRowAtY(y);

    if (row === null || row === -1) return false;

    const rowTop = this.rows.getY(row);
    const rowbottom = rowTop + this.rows.getHeight(row);

    const nearTopEdge = Math.abs(y - rowTop) <= this.edgeThreshold;
    const nearBottomEdge = Math.abs(y - rowbottom) <= this.edgeThreshold;

    if (nearTopEdge || nearBottomEdge) {
      this.wrapper.style.cursor = "row-resize";
      this.activeRow = row;
      return true;
    }

    return false;
  }

  onPointerDown(e) {
    this.startY = e.clientY;
    this.startHeight = this.rows.getHeight(this.activeRow);
  }

  onPointerMove(e) {
    if (this.activeRow === null) return;

    const dy = e.clientY - this.startY;
    const newHeight = Math.max(20, this.startHeight + dy);
    this.rows.resizeRow(this.activeRow, newHeight);
    this.render();
  }

  onPointerUp(e) {
    this.wrapper.style.cursor = "cell";
    this.activeRow = null;
  }
}
