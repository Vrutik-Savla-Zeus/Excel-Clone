import { Grid } from "./grid.js";

const canvasContainer = document.getElementById("canvasContainer");
const canvas = document.getElementById("excelCanvas");
const ctx = canvas.getContext("2d");

const TOTAL_ROWS = 100000;
const TOTAL_COLUMNS = 500;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 25;

const grid = new Grid(
  canvasContainer,
  canvas,
  ctx,
  TOTAL_ROWS,
  TOTAL_COLUMNS,
  CELL_WIDTH,
  CELL_HEIGHT
);

grid.render(); // Initial rendering of cells

canvasContainer.addEventListener("scroll", (e) => {
  grid.render(); // Re-render cells on scroll event
});

window.addEventListener("resize", () => {
  grid.resizeCanvas();
  grid.render();
});
