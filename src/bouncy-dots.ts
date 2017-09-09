export class BouncyDots {

  dots: Particle[] = [];
  existingTimer = null;

  constructor(private numLeds: number, private renderCallback) {
  }

  start() {
    if (this.existingTimer == null) {
      const stepFn = () => {
        return setTimeout(
          () => {
            this.render();
            this.step();
            this.existingTimer = stepFn();
          },
          1000 / 50
        );
      };
      this.existingTimer = stepFn();
    }
  }

  stop() {
    if (this.existingTimer != null) {
      clearTimeout(this.existingTimer);
      this.existingTimer = null;
    }
  }

  private step() {
    for (let i = 0; i < this.dots.length; i++) {
      const particle = this.dots[i];
      let newX = particle.x + particle.v;
      if (newX < 0 || newX > this.numLeds - 1) {
        // change direction
        particle.v = -particle.v;
        newX = particle.x + particle.v;
      }
      particle.x = newX;
    }
  }

  private render() {
    const buf = new Uint32Array(this.numLeds).fill(0x0);
    for (let i = 0; i < this.dots.length; i++) {
      const particle = this.dots[i];
      const dotCenter = Math.round(particle.x);
      for (let i = dotCenter - particle.size; i <= dotCenter + particle.size; i++) {
        if (i > 0 && i < this.numLeds) {
          buf[i] = buf[i] | particle.color;
        }
      }
    }
    this.renderCallback(buf);
  }
}

interface Particle {
  x: number;
  v: number;
  color: number;
  size: number;
}