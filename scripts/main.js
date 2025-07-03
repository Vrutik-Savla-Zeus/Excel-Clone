import { ExcelDOMRenderer } from "./dom/excelDOMRenderer.js";
import { EventManager } from "./event/EventManager.js";
import { CellData } from "./data/cellData.js";

import { GridCanvas } from "./canvas/gridCanvas.js";
import { HeaderCanvas } from "./canvas/headerCanvas.js";
import { IndexCanvas } from "./canvas/indexCanvas.js";
import { SelectAllCanvas } from "./canvas/selectAllCanvas.js";

import {
  TOTAL_ROWS,
  TOTAL_COLUMNS,
  CELL_WIDTH,
  CELL_HEIGHT,
} from "./utils/utils.js";

// 1. DOM Setup
const dom = new ExcelDOMRenderer();

// 2. Cell Data Setup
const cellData = new CellData();

// 3. Set wrapper size
dom.wrapper.style.width = `${TOTAL_COLUMNS * CELL_WIDTH + CELL_WIDTH / 2}px`;
dom.wrapper.style.height = `${TOTAL_ROWS * CELL_HEIGHT + CELL_HEIGHT}px`;

// 4. Canvas Instantiation
const gridCanvas = new GridCanvas(dom.container, cellData);
const headerCanvas = new HeaderCanvas(dom.container);
const indexCanvas = new IndexCanvas(dom.container);
const selectAllCanvas = new SelectAllCanvas(dom.container);

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
  cellInput: dom.cellInput,
  render,
  getInputPosition: dom.getInputPosition.bind(dom),
  gridCanvas,
  cellData,
});
eventManager.init();

// 7. Initial Render
render();

////////////////////////////////////////////////////////////////////////
async function fetchData(path) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    cellData.loadFromJSON(data);
  } catch (error) {
    console.error(`Error fetching in JSON data: ${error}`);
  }
}
await fetchData("../data/data.json");
gridCanvas.render();
