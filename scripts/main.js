import { Grid } from "./grid.js";

const canvasContainer = document.getElementById("canvasContainer");
const canvas = document.getElementById("excelCanvas");
const ctx = canvas.getContext("2d");

const canvasHeader = document.getElementById("headerCanvas");
const ctxHeader = canvasHeader.getContext("2d");

const canvasIndex = document.getElementById("indexCanvas");
const ctxIndex = canvasIndex.getContext("2d");

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
  TOTAL_ROWS,
  TOTAL_COLUMNS,
  CELL_WIDTH,
  CELL_HEIGHT
);

function renderCells() {
  grid.render();
  grid.renderHeader();
  grid.renderIndex();
}

// Initial rendering of cells
renderCells();

canvasContainer.addEventListener("scroll", (e) => {
  renderCells(); // Re-render cells on scroll event
});

window.addEventListener("resize", (e) => {
  renderCells(); // Re-render cells on window resize to set DPR
});
