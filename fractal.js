const Fractal = class {
  constructor(maxIterations = 1) {
    this.maxIterations = maxIterations
  }
  // https://en.wikipedia.org/wiki/Mandelbrot_set
  mandelbrot(x, y) {
    let z = { x: 0, y: 0 }
    let zx = z.x
    let zy = z.y
    let iterations = 0
    for (let i = 0; i < this.maxIterations; i++) {
      iterations = i
      z.x = zx * zx - zy * zy + x
      z.y = 2 * zx * zy + y
      zx = z.x
      zy = z.y
      if (z.x * z.x + z.y * z.y > 4) break 
    }
    return {
      value: z.x * z.x + z.y * z.y,
      iterations,
      diverged: z.x * z.x + z.y * z.y < 4,
    }
  }
}

export default Fractal
