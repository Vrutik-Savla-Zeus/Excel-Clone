export function handleScroll(
  container,
  getInputPosition,
  cellInput,
  editingRow,
  editingCol,
  render
) {
  container.addEventListener("scroll", () => {
    if (cellInput.style.display === "block" && editingRow !== null) {
      const position = getInputPosition(editingRow, editingCol);
      cellInput.style.left = `${position.left}px`;
      cellInput.style.top = `${position.top}px`;
    }

    requestAnimationFrame(() => render());
  });
}
