export function handleScroll(container, render) {
  container.addEventListener("scroll", () => {
    requestAnimationFrame(() => render());
  });
}
