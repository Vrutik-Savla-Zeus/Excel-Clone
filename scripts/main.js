import { Column } from "./column/column.js";
import { Row } from "./row/row.js";
import { ExcelDOMRenderer } from "./dom/excelDOMRenderer.js";
import { EventManager } from "./event/eventManager.js";
import { CellData } from "./data/cellData.js";

import { GridCanvas } from "./canvas/gridCanvas.js";
import { HeaderCanvas } from "./canvas/headerCanvas.js";
import { IndexCanvas } from "./canvas/indexCanvas.js";
import { SelectAllCanvas } from "./canvas/selectAllCanvas.js";

import { fetchData, resizeWrapper } from "./utils/utils.js";

// 1. DOM Setup
const columns = new Column(500, 100);
const rows = new Row(100000, 25);
const dom = new ExcelDOMRenderer(columns, rows);

// 2. Cell Data Setup
const cellData = new CellData(columns, rows);

// 3. Set wrapper size
resizeWrapper(dom.wrapper, columns, rows);

// 4. Canvas Instantiation
const gridCanvas = new GridCanvas(dom.container, columns, rows, cellData);
const headerCanvas = new HeaderCanvas(
  dom.container,
  columns,
  rows,
  gridCanvas.selectionManager
);
const indexCanvas = new IndexCanvas(
  dom.container,
  columns,
  rows,
  gridCanvas.selectionManager
);
const selectAllCanvas = new SelectAllCanvas(dom.container, columns, rows);

// 5. Render Method
function render() {
  resizeWrapper(dom.wrapper, columns, rows);
  gridCanvas.render();
  headerCanvas.render();
  indexCanvas.render();
  selectAllCanvas.render();
}

// 6. Event Setup
const eventManager = new EventManager({
  container: dom.container,
  wrapper: dom.wrapper,
  cellInput: dom.cellInput,
  render,
  gridCanvas,
  headerCanvas,
  indexCanvas,
  selectAllCanvas,
  cellData,
  columns,
  rows,
});

// 7. Initial Render
render();
await fetchData("../../data/data.json", cellData);
render();
