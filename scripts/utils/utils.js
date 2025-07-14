// UTILITY FUNCTIONS
/**
 * Returns the start/end row/column based on scroll
 */
export function getVisibleRange(container, columns, rows) {
  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;
  const viewWidth = container.clientWidth + 1;
  const viewHeight = container.clientHeight + 1;

  let startCol = columns.findColumnAtX(scrollLeft);
  let endCol = columns.findColumnAtX(scrollLeft + viewWidth);
  if (startCol === -1) startCol = 0;
  if (endCol === -1) endCol = columns.totalColumns - 1;
  else endCol = Math.min(endCol + 1, columns.totalColumns - 1);

  let startRow = rows.findRowAtY(scrollTop);
  let endRow = rows.findRowAtY(scrollTop + viewHeight);
  if (startRow === -1) startRow = 0;
  if (endRow === -1) endRow = rows.totalRows - 1;
  else endRow = Math.min(endRow + 1, rows.totalRows - 1);

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

export async function fetchData(path, cellDataInstance) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    cellDataInstance.loadFromJSON(data);
  } catch (error) {
    console.error(`Error fetching in JSON data: ${error}`);
  }
}

export function resizeWrapper(wrapper, columns, rows) {
  wrapper.style.width = `${columns.getTotalWidth() + 50}px`;
  wrapper.style.height = `${rows.getTotalHeight() + 25}px`;
}
