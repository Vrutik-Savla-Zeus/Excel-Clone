import { TouchManager } from "./touchManager.js";
import { ColumnResize } from "./columnResize.js";
import { RowResize } from "./rowResize.js";
import { ColumnSelection } from "./columnSelection.js";
import { RowSelection } from "./rowSelection.js";
import { CellSelection } from "./cellSelection.js";

export class EventManager {
  constructor({
    container,
    wrapper,
    cellInput,
    render,
    getInputPosition,
    gridCanvas,
    headerCanvas,
    indexCanvas,
    selectAllCanvas,
    cellData,
    columns,
    rows,
  }) {
    this.container = container;
    this.wrapper = wrapper;
    this.cellInput = cellInput;
    this.render = render;
    this.getInputPosition = getInputPosition;
    this.gridCanvas = gridCanvas;
    this.headerCanvas = headerCanvas;
    this.indexCanvas = indexCanvas;
    this.selectAllCanvas = selectAllCanvas;
    this.cellData = cellData;
    this.columns = columns;
    this.rows = rows;

    this._init();
  }

  _init() {
    this._handleScroll();
    this._handleResize();

    this.touchManager = new TouchManager(this.container);

    this.touchManager.registerHandler(
      new ColumnResize({
        container: this.container,
        wrapper: this.wrapper,
        headerCanvas: this.headerCanvas,
        columns: this.columns,
        rows: this.rows,
        render: this.render,
        edgeThreshold: 3,
      })
    );

    this.touchManager.registerHandler(
      new RowResize({
        container: this.container,
        wrapper: this.wrapper,
        indexCanvas: this.indexCanvas,
        columns: this.columns,
        rows: this.rows,
        render: this.render,
        edgeThreshold: 3,
      })
    );

    this.touchManager.registerHandler(
      new ColumnSelection({
        container: this.container,
        headerCanvas: this.headerCanvas,
        columns: this.columns,
        rows: this.rows,
        selectionManager: this.gridCanvas.selectionManager,
        render: this.render,
      })
    );

    this.touchManager.registerHandler(
      new RowSelection({
        container: this.container,
        indexCanvas: this.indexCanvas,
        columns: this.columns,
        rows: this.rows,
        selectionManager: this.gridCanvas.selectionManager,
        render: this.render,
      })
    );

    this.touchManager.registerHandler(
      new CellSelection({
        container: this.container,
        gridCanvas: this.gridCanvas,
        columns: this.columns,
        rows: this.rows,
        cellInput: this.cellInput,
        getInputPosition: this.getInputPosition,
        render: this.render,
        cellData: this.cellData,
      })
    );
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
}
