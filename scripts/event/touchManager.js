export class TouchManager {
  constructor(container) {
    this.container = container;

    this.handlers = [];
    this.currentHandler = null;

    this._initListeners();
  }

  registerHandler(handler) {
    this.handlers.push(handler);
  }

  _initListeners() {
    this.container.addEventListener("pointerdown", (e) =>
      this._handlePointerDown(e)
    );
    this.container.addEventListener("pointermove", (e) =>
      this._handlePointerMove(e)
    );
    this.container.addEventListener("pointerup", (e) =>
      this._handlePointerUp(e)
    );
  }

  _handlePointerDown(e) {
    for (const handler of this.handlers) {
      if (handler.hitTest?.(e)) {
        this.currentHandler = handler;
        handler.onPointerDown?.(e);
        break;
      }
    }
  }

  _handlePointerMove(e) {
    if (this.currentHandler !== null) {
      this.currentHandler.onPointerMove?.(e);
    } else {
      for (const handler of this.handlers) {
        if (handler.hitTest?.(e)) {
          return;
        }
      }
    }
  }

  _handlePointerUp(e) {
    if (this.currentHandler !== null) {
      this.currentHandler.onPointerUp?.(e);
      this.currentHandler = null;
    }
  }
}
