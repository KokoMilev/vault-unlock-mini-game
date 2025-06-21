import { Application, Container, Text } from "pixi.js";

export class Timer {
  public container: Container;
  private timerTxt: Text;
  private timeStart = 0;
  private app: Application;
  private isRunning = false;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();

    this.timerTxt = new Text({
      text: "0.0 s",
      style: {
        fill: "white",
        fontFamily: "Arial",
        fontSize: 32,
      },
    });
    this.container.addChild(this.timerTxt);

    this.app.ticker.add(this.update);
    this.reset();
  }

  private update = () => {
    if (!this.isRunning) return;
    const elapsed = (performance.now() - this.timeStart) / 1000;
    this.timerTxt.text = `${elapsed.toFixed(1)} s`;
  };

  start() {
    this.timeStart = performance.now();
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.timerTxt.text = "0.0 s";
  }

  setPosition(x: number, y: number) {
    this.container.position.set(x, y);
  }

  destroy() {
    this.app.ticker.remove(this.update);
  }
} 