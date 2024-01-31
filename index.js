import {
  Document,
  Rect,
  Text,
} from 'https://ross.ganyu.io/rossjs/framework.js'

import Fractal from './fractal.js'

const fractal = new Fractal(10000)

let width = 1000
let height = 1000

Document.canvas.setSize({
  width: 1000, height: 1000, scale: 1
})
let imageData = Document.canvas.ctx.createImageData(width, height)

const downloader = document.createElement('a')

let i = 0
let refreshComputing = () => {
  let max = 0
  let min = Infinity
  let dataPoints = []

  for (let iy = 0; iy < height; iy++) {
    for (let ix = 0; ix < width; ix++) {
      let x = -0.7496633224773869
      let y = +0.1006242655302586
      let scale = 1.5 * 0.705 ** i
      let rotation = 0.063 * i

      let transform = (px, py) => [
        (Math.cos(rotation) * px - Math.sin(rotation) * py) * scale + x,
        (Math.cos(rotation) * py + Math.sin(rotation) * px) * scale + y,
      ]
      let [cx, cy] = transform(-1 + ix / (width * 0.5), 1 - iy / (height * 0.5))
      let { iterations, diverged } = fractal.mandelbrot(cx, cy)
      let index = (ix + iy * imageData.width) * 4

      if (iterations > max) 
        max = iterations
      if (iterations < min)
        min = iterations

      dataPoints.push({
        index, iterations, diverged
      })
    }
  }

  for (let point of dataPoints) {
    let value = (point.iterations - min) / (max - min)
    imageData.data[point.index + 0] = point.diverged ? 0 : value * 255 * (350 / ((i + 1) ** 0.7)) - 31
    imageData.data[point.index + 1] = point.diverged ? 0 : value * 255 * (350 / ((i + 1) ** 0.7)) - 254
    imageData.data[point.index + 2] = point.diverged ? 0 : value * 255 * (350 / ((i + 1) ** 0.7)) + 31
    imageData.data[point.index + 3] = 255
  }
  
  let png = Document.canvas.canvas.toDataURL('image/png')
  downloader.href = png
  downloader.download = `frame${i}.png`
  downloader.click()

  return [min, max]
}

refreshComputing()
Rect.draw({
  x: 0, y: 0,
  width: Document.width, height: Document.height,
}).fill('#ffffff')
Document.canvas.ctx.putImageData(imageData, 0, 0)

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {
    i--
  } else if (e.key === 'ArrowRight') {
    i++
  }
  refreshComputing()
  Rect.draw({
    x: 0, y: 0,
    width: Document.width, height: Document.height,
  }).fill('#ffffff')
  Document.canvas.ctx.putImageData(imageData, 0, 0)
  Document.canvas.ctx.filter = `hue-rotate(${(18 * i) % 360}deg)`
  Document.canvas.ctx.drawImage(Document.canvas.canvas, 0, 0)
  Document.canvas.ctx.filter = 'none'
})

let time = 0
let tick = 0
let appLoop = async (newTime) => {
  let timeElapsed = newTime - time
  time = newTime
  tick++

  if (tick % 10 === 0 && i < 100) {
    i++
    let [min, max] = refreshComputing()
    Rect.draw({
      x: 0, y: 0,
      width: Document.width, height: Document.height,
    }).fill('#ffffff')
    Document.canvas.ctx.putImageData(imageData, 0, 0)
    Document.canvas.ctx.filter = `hue-rotate(${(18 * i) % 360}deg)`
    Document.canvas.ctx.drawImage(Document.canvas.canvas, 0, 0)
    Document.canvas.ctx.filter = 'none'
    /*
    Text.draw({
      x: 5, y: 5 + 10,
      align: 'left',
      text: `Min: ${min}`,
      size: 20,
    }).both('#ffffff', '#000000', 2.5)
    Text.draw({
      x: 5, y: 25 + 10,
      align: 'left',
      text: `Max: ${max}`,
      size: 20,
    }).both('#ffffff', '#000000', 2.5)
    Text.draw({
      x: 5, y: 50 + 10,
      align: 'left',
      text: `Frame: ${i}`,
      size: 20,
    }).both('#ffffff', '#000000', 2.5)
    */
  }
  requestAnimationFrame(appLoop)
}
requestAnimationFrame(appLoop)
