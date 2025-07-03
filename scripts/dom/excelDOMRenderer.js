import { CELL_HEIGHT, CELL_WIDTH } from "../utils/utils.js";

export class ExcelDOMRenderer {
  constructor(container) {
    this.container = container;
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
