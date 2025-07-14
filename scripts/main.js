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
  contextMenu: dom.contextMenu,
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
document.getElementById("upload-select").addEventListener("change", (e) => {
  const fileInput = document.getElementById("file-input");
  fileInput.accept = e.target.value === "json" ? ".json" : ".csv";
  fileInput.click();
  e.target.selectedIndex = 0; // reset to placeholder
});

document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const isCSV = file.name.endsWith(".csv");
  const text = await file.text();

  if (isCSV) {
    const rows = text
      .trim()
      .split("\n")
      .map((r) => r.split(","));
    const headers = rows[0];
    const data = rows
      .slice(1)
      .map((r) => Object.fromEntries(r.map((val, i) => [headers[i], val])));
    await cellData.loadFromJSON(data);
  } else {
    try {
      const json = JSON.parse(text);
      await cellData.loadFromJSON(json);
    } catch (err) {
      alert("Invalid JSON format.");
    }
  }

  render();
  e.target.value = ""; // reset file input
});
document.getElementById("clear-data").addEventListener("click", () => {
  cellData.data = {};
  render();
});

document.getElementById("download-csv").addEventListener("click", () => {
  const rows = Object.entries(cellData.data)
    .map(([key, val]) => {
      const [row, col] = key.split(":").map(Number);
      return { row, col, value: val.value ?? "" };
    })
    .reduce((acc, { row, col, value }) => {
      acc[row] = acc[row] || [];
      acc[row][col] = value;
      return acc;
    }, []);

  const csv = rows
    .map((row = []) => row.map((v = "") => `"${v}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sheet-data.csv";
  link.click();
});
