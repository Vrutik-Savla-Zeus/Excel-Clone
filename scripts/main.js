import { Grid } from "./grid.js";

const canvasContainer = document.getElementById("canvasContainer");
const canvas = document.getElementById("excelCanvas");
const ctx = canvas.getContext("2d");

const canvasHeader = document.getElementById("headerCanvas");
const ctxHeader = canvasHeader.getContext("2d");

const canvasIndex = document.getElementById("indexCanvas");
const ctxIndex = canvasIndex.getContext("2d");

const canvasTopLeft = document.getElementById("topLeftCanvas");
const ctxTopLeft = canvasTopLeft.getContext("2d");

const TOTAL_ROWS = 100000;
const TOTAL_COLUMNS = 500;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 25;

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

// TEST DATA ENTRY
grid.setCellData(10, 3, "HELLO");
grid.setCellData(1, 5, "123", { bold: true, italic: true });
grid.setCellData(5, 2, "Vrutik", { italic: true });
grid.setCellData(15, 8, "Savla", { bold: true });

// Initial rendering of cells
renderGrid();
grid.renderTopLeft();

canvasContainer.addEventListener("scroll", (e) => {
  renderGrid(); // Re-render cells on scroll event
});

window.addEventListener("resize", (e) => {
  renderGrid(); // Re-render cells on window resize to set DPR
});

/**
 * Handles rendering of whole excel grid
 */
function renderGrid() {
  grid.renderCells();
  grid.renderHeader();
  grid.renderIndex();
}
