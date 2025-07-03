// GLOBAL DECLARATIONS
export const TOTAL_ROWS = 100000;
export const TOTAL_COLUMNS = 500;
export const CELL_WIDTH = 100;
export const CELL_HEIGHT = 25;

// UTILITY FUNCTIONS
/**
 * Returns the start/end row/column based on scroll
 */
export function getVisibleRange(container) {
  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;
  const viewWidth = container.clientWidth + 1;
  const viewHeight = container.clientHeight + 1;

  const startCol = Math.floor(scrollLeft / CELL_WIDTH);

  const endCol = Math.min(
    TOTAL_COLUMNS,
    startCol + Math.ceil(viewWidth / CELL_WIDTH) + 1
  ); // const endCol = Math.min(
  //   this.totalColumns,
  //   Math.ceil((scrollLeft + viewWidth) / this.cellWidth)
  // );
  const startRow = Math.floor(scrollTop / CELL_HEIGHT);
  const endRow = Math.min(
    TOTAL_ROWS,
    startRow + Math.ceil(viewHeight / CELL_HEIGHT) + 1
  );
  // const endRow = Math.min(
  //   this.totalRows,
  //   Math.ceil((scrollTop + viewHeight) / this.cellHeight)
  // );

  return {
    scrollLeft,
    scrollTop,
    viewWidth,
    viewHeight,
    startCol,
    endCol,
    startRow,
    endRow,
  };
}

/**
 * Helper to set up canvas size, DPR scaling, and clear
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d rendering context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Number} width - Width of canvas
 * @param {Number} height -Height of canvas
 */
export function setupCanvas(ctx, canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
}

/**
 * Sets styling for column headers & row indexes
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d rendering context
 * @param {Number} fontSize - Size of text inside cell
 * @param {String} fontFamily - Font family of text inside cell
 * @param {String} textAlign - Alignment of text inside cell
 * @param {String} textBaseline - Baseline of text inside cell
 * @param {String} color - Color of text inside cell
 */
export function cellStyle(
  ctx,
  fontSize,
  fontFamily,
  textAlign,
  textBaseline,
  color,
  bold = false,
  italic = false
) {
  let style = "";
  if (italic) style += "italic ";
  if (bold) style += "bold ";

  ctx.font = `${style}${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = color;
}

/**
 * Takes index and gives column label (character)
 * @param {Number} index - Associated character with number
 * @returns Character
 */
export function getColumnLabel(index) {
  let label = "";
  while (index >= 0) {
    label = String.fromCharCode((index % 26) + 65) + label;
    index = Math.floor(index / 26) - 1;
  }
  return label;
}

export function getDpr() {
  return window.devicePixelRatio || 1;
}
