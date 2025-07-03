import { GridCanvas } from "./canvas/gridCanvas.js";
import { HeaderCanvas } from "./canvas/headerCanvas.js";
import { IndexCanvas } from "./canvas/indexCanvas.js";
import { SelectAllCanvas } from "./canvas/selectAllCanvas.js";
import { CellData } from "./data/cellData.js";
import { EventManager } from "./event/EventManager.js";
import { ExcelDOMRenderer } from "./dom/excelDOMRenderer.js";
import {
  TOTAL_ROWS,
  TOTAL_COLUMNS,
  CELL_WIDTH,
  CELL_HEIGHT,
} from "./utils/utils.js";

const cellData = new CellData();

// Set full grid size on wrapper div
const wrapper = document.getElementById("canvasWrapper");
wrapper.style.width = `${TOTAL_COLUMNS * CELL_WIDTH + CELL_WIDTH / 2}px`;
wrapper.style.height = `${TOTAL_ROWS * CELL_HEIGHT + CELL_HEIGHT}px`;
const canvasContainer = document.getElementById("canvasContainer");
const gridCanvas = new GridCanvas(canvasContainer, cellData);
const indexCanvas = new IndexCanvas(canvasContainer);
const headerCanvas = new HeaderCanvas(canvasContainer);
const selectAllCanvas = new SelectAllCanvas(canvasContainer);

render();

const cellInput = document.getElementById("cellInput");
const domRenderer = new ExcelDOMRenderer(canvasContainer);

const eventManager = new EventManager({
  container: canvasContainer,
  cellInput,
  render,
  getInputPosition: domRenderer.getInputPosition.bind(domRenderer),
  gridCanvas,
  cellData,
});
eventManager.init();

// RENDER
function render() {
  gridCanvas.render();
  indexCanvas.render();
  headerCanvas.render();
  selectAllCanvas.render();
}
