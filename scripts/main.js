import { Grid } from "./grid.js";
import { SelectionManager } from "./selectionManager.js";

// GLOBAL DECLARATIONS
// const TOTAL_ROWS = 25;
// const TOTAL_COLUMNS = 7;
const TOTAL_ROWS = 100000;
const TOTAL_COLUMNS = 500;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 25;

// SELECTING HTML ELEMENTS
const canvasContainer = document.getElementById("canvasContainer");
const canvas = document.getElementById("excelCanvas");
const ctx = canvas.getContext("2d");

const canvasHeader = document.getElementById("headerCanvas");
const ctxHeader = canvasHeader.getContext("2d");

const canvasIndex = document.getElementById("indexCanvas");
const ctxIndex = canvasIndex.getContext("2d");

const canvasTopLeft = document.getElementById("topLeftCanvas");
const ctxTopLeft = canvasTopLeft.getContext("2d");

// GRID RENDERING
const grid = new Grid(
  canvasContainer,
  canvas,
  ctx,
  canvasHeader,
  ctxHeader,
  canvasIndex,
  ctxIndex,
  canvasTopLeft,
  ctxTopLeft,
  TOTAL_ROWS,
  TOTAL_COLUMNS,
  CELL_WIDTH,
  CELL_HEIGHT
);
testData();
grid.render();
canvasContainer.addEventListener(
  "scroll",
  // Re-render cells on scroll event
  (e) => requestAnimationFrame(grid.render())
);
window.addEventListener(
  "resize",
  // Re-render cells on window resize to set DPR
  (e) => requestAnimationFrame(grid.render())
);

// CELL SELECTION
canvasContainer.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left + canvasContainer.scrollLeft;
  const y = e.clientY - rect.top + canvasContainer.scrollTop;

  const col = Math.floor(x / CELL_WIDTH);
  const row = Math.floor(y / CELL_HEIGHT);

  grid.selectionManager.setSelectedCell(row, col);
});

// TEST DATA ENTRY
function testData() {
  grid.setCellData(10, 3, "HELLO");
  grid.setCellData(1, 5, "123", { bold: true, italic: true });
  grid.setCellData(5, 2, "Vrutik", { italic: true });
  grid.setCellData(15, 8, "Savla", { bold: true });
}
