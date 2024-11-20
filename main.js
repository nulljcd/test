class AABB {
  constructor(minX, minY, maxX, maxY) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  intersects(other) {
    return this.minX < other.maxX && this.minY < other.maxY && this.maxX > other.minX && this.maxY > other.minY;
  }
}

class Particle {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;

    this.radius = 10;
    this.velocityX = 0;
    this.velocityY = 0;
    this.forceX = 0;
    this.forceY = 0;

    this.AABB = new AABB(
      this.positionX - this.radius,
      this.positionY - this.radius,
      this.positionX + this.radius,
      this.positionY + this.radius);
  }

  update(deltaTime) {
    this.velocityX += this.forceX * (deltaTime * deltaTime);
    this.velocityY += this.forceY * (deltaTime * deltaTime);
    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
    this.forceX = 0;
    this.forceY = 0;

    this.AABB.minX = this.positionX - this.radius;
    this.AABB.minY = this.positionY - this.radius;
    this.AABB.maxX = this.positionX + this.radius;
    this.AABB.maxY = this.positionY + this.radius;
  }
}

class Line {
  constructor(position0X, position0Y, position1X, position1Y) {
    this.position0X = position0X;
    this.position0Y = position0Y;
    this.position1X = position1X;
    this.position1Y = position1Y;

    this.AABB = new AABB(
      Math.min(this.position0X, this.position1X),
      Math.min(this.position0Y, this.position1Y),
      Math.max(this.position0X, this.position1X),
      Math.max(this.position0Y, this.position1Y));
  }
}

class World {
  constructor() {
    this.particles = [];
    this.lines = [];
  }

  step(deltaTime) {

    this.particles.forEach(particle => {
      particle.forceY += 300;
      particle.update(deltaTime);
    });

    this.particles.forEach(particle => {
      let particleSpeed = Math.sqrt(particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY);
      let particleDirectionX = particle.velocityX / particleSpeed;
      let particleDirectionY = particle.velocityY / particleSpeed;
      this.lines.forEach(line => {
        if (particle.AABB.intersects(line.AABB)) {
          let acX = particle.positionX - line.position0X;
          let acY = particle.positionY - line.position0Y;
          let abX = line.position1X - line.position0X;
          let abY = line.position1Y - line.position0Y;
          let projK = ((acX * abX) + (acY * abY)) / ((abX * abX) + (abY * abY));
          let projX = projK * abX;
          let projY = projK * abY;
          let dX = Math.max(Math.min(projX + line.position0X, Math.max(line.position0X, line.position1X)), Math.min(line.position0X, line.position1X));
          let dY = Math.max(Math.min(projY + line.position0Y, Math.max(line.position0Y, line.position1Y)), Math.min(line.position0Y, line.position1Y));
          let length2 = (dX - particle.positionX) * (dX - particle.positionX) + (dY - particle.positionY) * (dY - particle.positionY);
          if (length2 < particle.radius * particle.radius) {
            let length = Math.sqrt(length2);
            let normalX = (dX - particle.positionX) / length;
            let normalY = (dY - particle.positionY) / length;
            particle.positionX -= normalX * (particle.radius - length);
            particle.positionY -= normalY * (particle.radius - length);
            particle.velocityX = (particleDirectionX - (normalX * (2 * ((particleDirectionX * normalX) + (particleDirectionY * normalY))))) * particleSpeed;
            particle.velocityY = (particleDirectionY - (normalY * (2 * ((particleDirectionX * normalX) + (particleDirectionY * normalY))))) * particleSpeed;
          }
        }
      });
    });
  }
}

class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.world = world;

    this.canvas.width = 16 * 48;
    this.canvas.height = 10 * 48;
    this.ctx = this.canvas.getContext('2d');
  }

  render() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.world.particles.forEach(particle => {
      this.ctx.fillStyle = '#49f';
      this.ctx.beginPath();
      this.ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.strokeStyle = '#fff';
    this.world.lines.forEach(line => {
      this.ctx.beginPath();
      this.ctx.moveTo(line.position0X, line.position0Y);
      this.ctx.lineTo(line.position1X, line.position1Y);
      this.ctx.stroke();
    });
  }
}



let world = new World();
let renderer = new Renderer(document.querySelector('#canvas'), world);

function run() {
  requestAnimationFrame(run);

  world.step(1 / 60);
  renderer.render();
}

run();