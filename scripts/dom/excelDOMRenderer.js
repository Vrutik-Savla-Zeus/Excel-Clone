export class ExcelDOMRenderer {
  constructor(columns, rows) {
    this.columns = columns;
    this.rows = rows;

    this.container = this._createCanvasContainer();
    this.wrapper = this._createCanvasWrapper();
    this.cellInput = this._createInput();
    this.contextMenu = this._createContextMenu();

    this.container.appendChild(this.wrapper);
    document.body.appendChild(this.container);
    document.body.appendChild(this.cellInput);
  }

  _createCanvasContainer() {
    const container = document.createElement("div");
    container.className = "canvas-container";
    container.id = "canvasContainer";
    container.tabIndex = "0";
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

  _createContextMenu() {
    const menu = document.createElement("div");
    menu.id = "contextMenu";
    menu.className = "excel-context-menu";
    menu.style.position = "absolute";
    menu.style.display = "none";
    menu.style.zIndex = "1000";
    menu.innerHTML = `
    <div data-action="insert-row-above">Insert row above</div>
    <div data-action="insert-row-below">Insert row below</div>
    <div data-action="insert-col-left">Insert column left</div>
    <div data-action="insert-col-right">Insert column right</div>
    <div data-action="delete-row">Delete row</div>
    <div data-action="delete-col">Delete column</div>
  `;
    document.body.appendChild(menu);
    return menu;
  }
}
