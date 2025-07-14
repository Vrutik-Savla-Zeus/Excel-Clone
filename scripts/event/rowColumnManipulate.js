// event/rowColumnManipulate.js
import { getColumnLabel, resizeWrapper } from "../utils/utils.js";

export class RowColumnManipulate {
  constructor({
    container,
    contextMenu,
    gridCanvas,
    cellData,
    columns,
    rows,
    render,
  }) {
    this.container = container;
    this.contextMenu = contextMenu;
    this.gridCanvas = gridCanvas;
    this.cellData = cellData;
    this.columns = columns;
    this.rows = rows;
    this.render = render;

    this._init();
  }

  _init() {
    this.container.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left + this.container.scrollLeft;
      const y = e.clientY - rect.top + this.container.scrollTop;

      this.contextMenu.style.top = `${e.clientY}px`;
      this.contextMenu.style.left = `${e.clientX}px`;
      this.contextMenu.style.display = "block";

      this.row = this.rows.findRowAtY(y);
      this.col = this.columns.findColumnAtX(x);
      this.contextMenu.querySelector(
        "[data-action='delete-row']"
      ).innerText = `Delete row ${this.row + 1}`;
      this.contextMenu.querySelector(
        "[data-action='delete-col']"
      ).innerText = `Delete column ${getColumnLabel(this.col)}`;
    });

    document.addEventListener("click", (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.contextMenu.style.display = "none";
      }
    });

    this.contextMenu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      const row = this.row;
      const col = this.col;

      switch (action) {
        case "insert-row-above":
          this.insertRowAt(row);
          break;
        case "insert-row-below":
          this.insertRowAt(row + 1);
          break;
        case "delete-row":
          this.deleteRowAt(row);
          break;
        case "insert-col-left":
          this.insertColAt(col);
          break;
        case "insert-col-right":
          this.insertColAt(col + 1);
          break;
        case "delete-col":
          this.deleteColAt(col);
          break;
      }

      this.contextMenu.style.display = "none";
      resizeWrapper(this.container, this.columns, this.rows);
      this.render();
    });
  }

  insertRowAt(rowIndex) {
    this.rows.heights.splice(rowIndex, 0, 25);
    this.rows.totalRows += 1;
    this.rows._recalculatePositions();

    const newData = {};
    for (const key in this.cellData.data) {
      const [r, c] = key.split(":").map(Number);
      if (r >= rowIndex) {
        newData[`${r + 1}:${c}`] = this.cellData.data[key];
      } else {
        newData[key] = this.cellData.data[key];
      }
    }
    this.cellData.data = newData;
  }

  deleteRowAt(rowIndex) {
    if (this.rows.totalRows <= 1) return;

    this.rows.heights.splice(rowIndex, 1);
    this.rows.totalRows -= 1;
    this.rows._recalculatePositions();

    const newData = {};
    for (const key in this.cellData.data) {
      const [r, c] = key.split(":").map(Number);
      if (r < rowIndex) {
        newData[key] = this.cellData.data[key];
      } else if (r > rowIndex) {
        newData[`${r - 1}:${c}`] = this.cellData.data[key];
      }
    }
    this.cellData.data = newData;
  }

  insertColAt(colIndex) {
    this.columns.widths.splice(colIndex, 0, 100);
    this.columns.totalColumns += 1;
    this.columns._recalculatePositions();

    const newData = {};
    for (const key in this.cellData.data) {
      const [r, c] = key.split(":").map(Number);
      if (c >= colIndex) {
        newData[`${r}:${c + 1}`] = this.cellData.data[key];
      } else {
        newData[key] = this.cellData.data[key];
      }
    }
    this.cellData.data = newData;
  }

  deleteColAt(colIndex) {
    if (this.columns.totalColumns <= 1) return;

    this.columns.widths.splice(colIndex, 1);
    this.columns.totalColumns -= 1;
    this.columns._recalculatePositions();

    const newData = {};
    for (const key in this.cellData.data) {
      const [r, c] = key.split(":").map(Number);
      if (c < colIndex) {
        newData[key] = this.cellData.data[key];
      } else if (c > colIndex) {
        newData[`${r}:${c - 1}`] = this.cellData.data[key];
      }
    }
    this.cellData.data = newData;
  }
}
