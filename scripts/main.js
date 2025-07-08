import { Column } from "./column/column.js";
import { Row } from "./row/row.js";
import { ExcelDOMRenderer } from "./dom/excelDOMRenderer.js";
import { EventManager } from "./event/eventManager.js";
import { CellData } from "./data/cellData.js";

import { GridCanvas } from "./canvas/gridCanvas.js";
import { HeaderCanvas } from "./canvas/headerCanvas.js";
import { IndexCanvas } from "./canvas/indexCanvas.js";
import { SelectAllCanvas } from "./canvas/selectAllCanvas.js";

import { fetchData } from "./utils/utils.js";

// 1. DOM Setup
const columns = new Column();
const rows = new Row();
const dom = new ExcelDOMRenderer(columns, rows);

// 2. Cell Data Setup
const cellData = new CellData(columns, rows);

// 3. Set wrapper size
dom.wrapper.style.width = `${columns.getTotalWidth() + columns.getX(1) / 2}px`;
dom.wrapper.style.height = `${rows.getTotalHeight() + rows.getY(1)}px`;

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
  getInputPosition: dom.getInputPosition.bind(dom),
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
gridCanvas.render();
// console.log(columns.getWidth(0));
// console.log(rows.getHeight(0));
