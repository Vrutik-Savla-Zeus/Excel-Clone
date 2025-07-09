export class TouchManager {
  constructor(container, wrapper) {
    this.container = container;
    this.wrapper = wrapper;

    this.handlers = [];
    this.activeHandler = null;
    this.currentHandler = null;

    this._initListeners();
  }

  registerHandler(handler) {
    this.handlers.push(handler);
  }

  _initListeners() {
    this.container.addEventListener("pointerdown", (e) =>
      this._onPointerDown(e)
    );
    this.container.addEventListener("pointermove", (e) =>
      this._onPointerMove(e)
    );
    this.container.addEventListener("pointerup", (e) => this._onPointerUp(e));
  }

  _onPointerMove(e) {
    if (this.currentHandler) {
      this.currentHandler.onPointerMove(e);
      return;
    }

    let found = false;

    for (const handler of this.handlers) {
      const isHit = handler.hitTest(e);
      if (isHit) {
        this.activeHandler = handler;
        found = true;
        break;
      }
    }

    if (!found) {
      this.activeHandler = null;
      this.wrapper.style.cursor = "cell";
    }
  }

  _onPointerDown(e) {
    if (this.activeHandler) {
      this.currentHandler = this.activeHandler;
      this.currentHandler.onPointerDown(e);
    }
  }

  _onPointerUp(e) {
    if (this.currentHandler) {
      this.currentHandler.onPointerUp(e);
      this.currentHandler = null;
    }
  }
}
