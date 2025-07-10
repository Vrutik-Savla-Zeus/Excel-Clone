export function handleScroll(container, cellInput, render) {
  container.addEventListener("scroll", () => {
    if (cellInput.style.display === "block" && this.editingRow !== null) {
      const position = this.getInputPosition(this.editingRow, this.editingCol);
      cellInput.style.left = `${position.left}px`;
      cellInput.style.top = `${position.top}px`;
    }

    requestAnimationFrame(() => render());
  });
}
