import { TouchManager } from "./touchManager.js";
import { ColumnResize } from "./columnResize.js";
import { RowResize } from "./rowResize.js";
import { ColumnSelection } from "./columnSelection.js";
import { RowSelection } from "./rowSelection.js";
import { CellSelection } from "./cellSelection.js";
import { handleScroll } from "./scroll.js";
import { handleResize } from "./windowResize.js";

export class EventManager {
  constructor({
    container,
    wrapper,
    cellInput,
    render,
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
    this.touchManager = new TouchManager(this.container);
    this.columnResize = new ColumnResize({
      container: this.container,
      wrapper: this.wrapper,
      headerCanvas: this.headerCanvas,
      columns: this.columns,
      rows: this.rows,
      render: this.render,
      edgeThreshold: 3,
    });
    this.rowResize = new RowResize({
      container: this.container,
      wrapper: this.wrapper,
      indexCanvas: this.indexCanvas,
      columns: this.columns,
      rows: this.rows,
      render: this.render,
      edgeThreshold: 3,
    });
    this.columnSelection = new ColumnSelection({
      container: this.container,
      headerCanvas: this.headerCanvas,
      columns: this.columns,
      rows: this.rows,
      selectionManager: this.gridCanvas.selectionManager,
      render: this.render,
    });
    this.rowSelection = new RowSelection({
      container: this.container,
      indexCanvas: this.indexCanvas,
      columns: this.columns,
      rows: this.rows,
      selectionManager: this.gridCanvas.selectionManager,
      render: this.render,
    });
    this.cellSelection = new CellSelection({
      container: this.container,
      wrapper: this.wrapper,
      gridCanvas: this.gridCanvas,
      columns: this.columns,
      rows: this.rows,
      cellInput: this.cellInput,
      getInputPosition: this.getInputPosition,
      render: this.render,
      cellData: this.cellData,
    });

    this.touchManager.registerHandler(this.columnResize);
    this.touchManager.registerHandler(this.rowResize);
    this.touchManager.registerHandler(this.columnSelection);
    this.touchManager.registerHandler(this.rowSelection);
    this.touchManager.registerHandler(this.cellSelection);

    handleScroll(this.container, this.render);

    handleResize(this.render);
  }
}
