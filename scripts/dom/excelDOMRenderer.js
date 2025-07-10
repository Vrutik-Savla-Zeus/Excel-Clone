export class ExcelDOMRenderer {
  constructor(columns, rows) {
    this.columns = columns;
    this.rows = rows;

    this.container = this._createCanvasContainer();
    this.wrapper = this._createCanvasWrapper();
    this.cellInput = this._createInput();

    this.container.appendChild(this.wrapper);
    document.body.appendChild(this.container);
    document.body.appendChild(this.cellInput);
  }

  _createCanvasContainer() {
    const container = document.createElement("div");
    container.className = "canvas-container";
    container.id = "canvasContainer";
    return container;
  }

  _createCanvasWrapper() {
    const wrapper = document.createElement("div");
    wrapper.className = "canvas-wrapper";
    wrapper.id = "canvasWrapper";
    return wrapper;
  }

  _createInput() {
    const input = document.createElement("input");
    input.id = "cellInput";
    input.name = "cell-input";
    input.type = "text";
    input.className = "cell-input";
    input.tabIndex = 0;
    return input;
  }

  getInputPosition(row, col) {
    const containerRect = this.container.getBoundingClientRect();
    const left =
      this.columns.getX(col) -
      this.container.scrollLeft +
      this.columns.getX(1) / 2 +
      containerRect.left;

    const top =
      this.rows.getY(row) -
      this.container.scrollTop +
      this.rows.getY(1) +
      containerRect.top;

    return { left, top };
  }
}
