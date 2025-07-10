export class TouchManager {
  constructor(container) {
    this.container = container;

    this.handlers = [];
    this.activeHandler = null;

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
    if (this.activeHandler !== null) {
      this.activeHandler.onPointerDown?.(e);
      return;
    }

    for (const handler of this.handlers) {
      if (handler.hitTest?.(e)) {
        this.activeHandler = handler;
        handler.onPointerDown?.(e);
        break;
      }
    }
  }

  _handlePointerMove(e) {
    if (this.activeHandler !== null) {
      this.activeHandler.onPointerMove?.(e);
    } else {
      for (const handler of this.handlers) {
        if (handler.hitTest?.(e)) {
          return;
        }
      }
    }
  }

  _handlePointerUp(e) {
    if (this.activeHandler !== null) {
      this.activeHandler.onPointerUp?.(e);
      this.activeHandler = null;
    }
  }
}
