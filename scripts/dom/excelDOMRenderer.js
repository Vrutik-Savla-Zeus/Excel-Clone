import { CELL_HEIGHT, CELL_WIDTH } from "../utils/utils.js";

export class ExcelDOMRenderer {
  constructor() {
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
    return input;
  }

  getInputPosition(row, col) {
    const containerRect = this.container.getBoundingClientRect();
    const left =
      col * CELL_WIDTH - this.container.scrollLeft + 50 + containerRect.left;
    const top =
      row * CELL_HEIGHT - this.container.scrollTop + 25 + containerRect.top;
    return { left, top };
  }
}
