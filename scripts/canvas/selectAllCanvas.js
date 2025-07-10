import { setupCanvas } from "../utils/utils.js";

export class SelectAllCanvas {
  constructor(container, columns, rows) {
    this.container = container;
    this.columns = columns;
    this.rows = rows;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "select-all-canvas";
    this.canvas.id = "selectAllCanvas";
    this.ctx = this.canvas.getContext("2d");

    this._init();
  }

  _init() {
    document.getElementById("canvasWrapper").appendChild(this.canvas);
  }

  /**
   * Renders Top Left corner of grid
   */
  render() {
    const width = 50;
    const height = 25;

    setupCanvas(this.ctx, this.canvas, width, height);
    this.ctx.fillStyle = "#f3f3f3";
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.beginPath();
    this.ctx.moveTo(45, 5);
    this.ctx.lineTo(20, 20);
    this.ctx.lineTo(45, 20);
    this.ctx.closePath();
    this.ctx.fillStyle = "#888";
    this.ctx.fill();
  }
}
