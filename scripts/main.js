import { Grid } from "./grid.js";
import { SelectionManager } from "./selectionManager.js";

// GLOBAL DECLARATIONS
const TOTAL_ROWS = 100000;
const TOTAL_COLUMNS = 500;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 25;
let EDITING_ROW = null;
let EDITING_COL = null;

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

const cellInput = document.getElementById("cellInput");

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

// SCROLLING
canvasContainer.addEventListener("scroll", () => {
  if (cellInput.style.display === "block" && EDITING_ROW !== null) {
    const position = getInputPosition(EDITING_ROW, EDITING_COL);
    cellInput.style.left = `${position.left}px`;
    cellInput.style.top = `${position.top}px`;
  }

  requestAnimationFrame(() => grid.render());
});

// RESIZING
window.addEventListener("resize", () => {
  requestAnimationFrame(() => grid.render());
});

// SINGLE CELL SELECTION
canvasContainer.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left + canvasContainer.scrollLeft;
  const y = e.clientY - rect.top + canvasContainer.scrollTop;

  const col = Math.floor(x / CELL_WIDTH);
  const row = Math.floor(y / CELL_HEIGHT);

  grid.selectionManager.setSelectedCell(row, col);
});

// INPUT CELL EDIT
canvasContainer.addEventListener("dblclick", (e) => {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const scrollLeft = canvasContainer.scrollLeft;
  const scrollTop = canvasContainer.scrollTop;

  const x = e.clientX - rect.left + scrollLeft;
  const y = e.clientY - rect.top + scrollTop;

  const col = Math.floor(x / CELL_WIDTH);
  const row = Math.floor(y / CELL_HEIGHT);
  EDITING_COL = col;
  EDITING_ROW = row;

  const position = getInputPosition(row, col);

  cellInput.style.display = "block";
  cellInput.style.left = `${position.left}px`;
  cellInput.style.top = `${position.top}px`;
  cellInput.style.width = `${CELL_WIDTH}px`;
  cellInput.style.height = `${CELL_HEIGHT}px`;
  cellInput.style.border = `${2 / dpr}px solid #008000`;
  cellInput.value = grid.getCellData(row, col)?.value || "";
  cellInput.focus();

  // Save on blur or enter
  const finishEdit = () => {
    const value = cellInput.value.trim();
    if (value) grid.setCellData(row, col, value);
    cellInput.style.display = "none";
    EDITING_COL = null;
    EDITING_ROW = null;
    grid.render();
  };

  cellInput.onkeydown = (event) => {
    if (event.key === "Enter") finishEdit();
  };

  cellInput.onblur = finishEdit;
});

// GET INPUT POSITION (uses fixed layout)
function getInputPosition(row, col) {
  const containerRect = canvasContainer.getBoundingClientRect();
  const left =
    col * CELL_WIDTH - canvasContainer.scrollLeft + 50 + containerRect.left;
  const top =
    row * CELL_HEIGHT - canvasContainer.scrollTop + 25 + containerRect.top;
  return { left, top };
}

// SAMPLE DATA
function testData() {
  grid.setCellData(10, 3, "HELLO");
  grid.setCellData(1, 5, "123", { bold: true, italic: true });
  grid.setCellData(5, 2, "Vrutik", { italic: true });
  grid.setCellData(15, 8, "Savla", { bold: true });
}
