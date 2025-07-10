export function handleResize(render) {
  window.addEventListener("resize", () => {
    requestAnimationFrame(() => render());
  });
}
