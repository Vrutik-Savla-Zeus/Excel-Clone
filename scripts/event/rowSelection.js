export class RowSelection {
  constructor({
    container,
    indexCanvas,
    columns,
    rows,
    selectionManager,
    render,
  }) {
    this.container = container;
    this.indexCanvas = indexCanvas;
    this.columns = columns;
    this.rows = rows;
    this.selectionManager = selectionManager;
    this.render = render;

    this.startRow = null;
    this.isSelecting = false;
  }

  hitTest(e) {
    const rect = this.indexCanvas.canvas.getBoundingClientRect();
    const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
    const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;

    const isScrollbarClick =
      e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight;
    if (isScrollbarClick) return false;

    return withinX && withinY;
  }

  onPointerDown(e) {
    const rect = this.indexCanvas.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top + this.container.scrollTop;

    const row = this.rows.findRowAtY(y);
    if (row === -1 || row == null) return;

    this.startRow = row;
    this.isSelecting = true;

    this.selectionManager.setAnchorCell(row, 0);
    this.selectionManager.setFocusCell(row, this.columns.totalColumns - 1);
    this.render();
  }

  onPointerMove(e) {
    if (!this.isSelecting) return;

    const rect = this.indexCanvas.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top + this.container.scrollTop;

    const row = this.rows.findRowAtY(y);
    if (row === -1 || row == null) return;

    this.selectionManager.setFocusCell(row, this.columns.totalColumns - 1);
    this.render();
  }

  onPointerUp(e) {
    this.isSelecting = false;
    this.startRow = null;
  }
}
