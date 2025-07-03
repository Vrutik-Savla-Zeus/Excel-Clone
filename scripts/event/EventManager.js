import { CELL_HEIGHT, CELL_WIDTH, getDpr } from "../utils/utils.js";

export class EventManager {
  constructor({
    container,
    cellInput,
    render,
    getInputPosition,
    gridCanvas,
    cellData,
  }) {
    this.container = container;
    this.cellInput = cellInput;
    this.render = render;
    this.getInputPosition = getInputPosition;
    this.gridCanvas = gridCanvas;
    this.cellData = cellData;

    this.editingRow = null;
    this.editingCol = null;
  }

  setEditingCell(row, col) {
    this.editingRow = row;
    this.editingCol = col;
  }

  init() {
    this._handleScroll();
    this._handleResize();
    this._handleClick();
    this._handleDoubleClick();
  }

  _handleScroll() {
    this.container.addEventListener("scroll", () => {
      if (
        this.cellInput.style.display === "block" &&
        this.editingRow !== null
      ) {
        const position = this.getInputPosition(
          this.editingRow,
          this.editingCol
        );
        this.cellInput.style.left = `${position.left}px`;
        this.cellInput.style.top = `${position.top}px`;
      }

      requestAnimationFrame(() => this.render());
    });
  }

  _handleResize() {
    window.addEventListener("resize", () => {
      requestAnimationFrame(() => this.render());
    });
  }

  _handleClick() {
    this.container.addEventListener("click", (e) => {
      const rect = document
        .getElementById("gridCanvas")
        .getBoundingClientRect();
      const x = e.clientX - rect.left + this.container.scrollLeft;
      const y = e.clientY - rect.top + this.container.scrollTop;

      const col = Math.floor(x / CELL_WIDTH);
      const row = Math.floor(y / CELL_HEIGHT);

      this.gridCanvas.selectionManager.setSelectedCell(row, col);
    });
  }

  _handleDoubleClick() {
    this.container.addEventListener("dblclick", (e) => {
      const dpr = getDpr();
      const rect = document
        .getElementById("gridCanvas")
        .getBoundingClientRect();
      const scrollLeft = this.container.scrollLeft;
      const scrollTop = this.container.scrollTop;

      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      const col = Math.floor(x / CELL_WIDTH);
      const row = Math.floor(y / CELL_HEIGHT);
      this.setEditingCell(row, col);

      const position = this.getInputPosition(row, col);

      this.cellInput.style.display = "block";
      this.cellInput.style.left = `${position.left}px`;
      this.cellInput.style.top = `${position.top}px`;
      this.cellInput.style.width = `${CELL_WIDTH}px`;
      this.cellInput.style.height = `${CELL_HEIGHT}px`;
      this.cellInput.style.border = `${2 / dpr}px solid #008000`;
      this.cellInput.value = this.cellData.getCellData(row, col)?.value || "";
      this.cellInput.focus();

      const finishEdit = () => {
        const value = this.cellInput.value.trim();
        this.cellData.setCellData(row, col, value);
        this.cellInput.style.display = "none";
        this.setEditingCell(null, null);
        this.gridCanvas.render();
      };

      this.cellInput.onkeydown = (event) => {
        if (event.key === "Enter") finishEdit();
      };
      this.cellInput.onblur = finishEdit;
    });
  }
}
