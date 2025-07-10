export class ColumnSelection {
  constructor({
    container,
    headerCanvas,
    columns,
    rows,
    selectionManager,
    render,
  }) {
    this.container = container;
    this.headerCanvas = headerCanvas;
    this.columns = columns;
    this.rows = rows;
    this.selectionManager = selectionManager;
    this.render = render;

    this.startCol = null;
    this.isSelecting = false;
  }

  hitTest(e) {
    const rect = this.headerCanvas.canvas.getBoundingClientRect();
    const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
    const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;
    return withinX && withinY;
  }

  onPointerDown(e) {
    const rect = this.headerCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const col = this.columns.findColumnAtX(x);

    if (col === -1 || col == null) return;

    this.startCol = col;
    this.isSelecting = true;

    this.selectionManager.setAnchorCell(0, col);
    this.selectionManager.setFocusCell(this.rows.totalRows - 1, col);
    this.render();
  }

  onPointerMove(e) {
    if (!this.isSelecting) return;

    const rect = this.headerCanvas.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + this.container.scrollLeft;
    const col = this.columns.findColumnAtX(x);

    if (col === -1 || col == null) return;

    this.selectionManager.setFocusCell(this.rows.totalRows - 1, col);
    this.render();
  }

  onPointerUp(e) {
    this.isSelecting = false;
    this.startCol = null;
  }
}
