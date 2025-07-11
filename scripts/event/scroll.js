import { getInputPosition } from "../utils/utils.js";

export function handleScroll(
  container,
  columns,
  rows,
  cellInput,
  editingRow,
  editingCol,
  render
) {
  container.addEventListener("scroll", () => {
    if (cellInput.style.display === "block" && editingRow !== null) {
      const position = getInputPosition(
        container,
        columns,
        rows,
        editingCol,
        editingRow
      );
      cellInput.style.left = `${position.left}px`;
      cellInput.style.top = `${position.top}px`;
    }

    requestAnimationFrame(() => render());
  });
}

/*
This is existing code and it has bugs
What I need is, single cell selection and cellinput element to always go together. Remove getInputCellPosition from dom file and put it in cell selection file. Their should be to methods, getInputCellPosition and setInputCellPosition (get will get position and set will set new position with respect to current cell selection.) On first mount (first load basically), no cell will be selected. Then their is pointerdown event, cell selection will take place and input element will be present their itself with that cell selection, but input element will be blured. On key down event input will be get focused and typing will be start. (If keys are enter or arrow keys then input will be blured and move in arrow direction (enter will be reponsible for arrow down)). If value is already present in cell and if input is blured then on typing will overide previous value and start with new one. If their is db click then input will directly get focus and typing will not override previous data. If their is drag then input will always be diabled (this will be multi cell selection case)), in this case after drag if their is any key down event then multi cell selection will collapse to single cell from where pointerdown started.
(DON"T MAKE AYNY FUNCTION INSIDE A FUNCTION).
*/
