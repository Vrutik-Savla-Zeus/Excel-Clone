export class ColumnResize {
  constructor({
    container,
    wrapper,
    headerCanvas,
    columns,
    rows,
    render,
    edgeThreshold = 3,
  }) {
    this.container = container;
    this.wrapper = wrapper;
    this.headerCanvas = headerCanvas;
    this.columns = columns;
    this.rows = rows;
    this.render = render;
    this.edgeThreshold = edgeThreshold;

    this.activeCol = null;
    this.startX = 0;
    this.startWidth = 0;
  }

  hitTest(e) {
    const rect = this.headerCanvas.canvas.getBoundingClientRect();

    const withinY =
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom &&
      e.clientX > rect.left + this.edgeThreshold &&
      e.clientX <= rect.right;

    if (!withinY) return false;

    const scrollLeft = this.container.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    const col = this.columns.findColumnAtX(x);

    if (col === null || col === -1) return false;

    const colLeft = this.columns.getX(col);
    const colRight = colLeft + this.columns.getWidth(col);

    const nearLeftEdge = Math.abs(x - colLeft) <= this.edgeThreshold;
    const nearRightEdge = Math.abs(x - colRight) <= this.edgeThreshold;

    if (nearRightEdge || nearLeftEdge) {
      this.wrapper.style.cursor = "col-resize";
      this.activeCol = col;
      return true;
    } else {
      this.wrapper.style.cursor = "cell";
    }

    return false;
  }

  onPointerDown(e) {
    this.startX = e.clientX;
    this.startWidth = this.columns.getWidth(this.activeCol);
  }

  onPointerMove(e) {
    if (this.activeCol === null) return;

    const dx = e.clientX - this.startX;
    const newWidth = Math.max(20, this.startWidth + dx);
    this.columns.resizeColumn(this.activeCol, newWidth);
    this.render();
  }

  onPointerUp(e) {
    this.wrapper.style.cursor = "cell";
    this.activeCol = null;
  }
}
