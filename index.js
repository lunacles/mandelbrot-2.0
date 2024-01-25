import {
  Document,
  Rect,
} from 'https://ross.ganyu.io/rossjs/framework.js'

import Fractal from './fractal.js'

const fractal = new Fractal(10000)

let width = Document.height / 2
let height = Document.height / 2

let imageData = Document.canvas.ctx.createImageData(width, height)

let rgbToHsv = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  let max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0
  let s = 0 
  let v = max

  let d = max - min
  s = max === 0 ? 0 : d / max

  if (max === min) {
    h = 0
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0) 
        break
      case g: h = (b - r) / d + 2
        break
      case b: h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s, v]
}
let hsvToRgb = (h, s, v) => {
  let r = 0
  let g = 0
  let b = 0

  let i = Math.floor(h / 60)
  let f = h / 60 - i
  let p = v * (1 - s)
  let q = v * (1 - f * s)
  let t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: 
      r = v
      g = t
      b = p
      break
    case 1: 
      r = q
      g = v
      b = p
      break
    case 2: 
      r = p
      g = v
      b = t
      break
    case 3: 
      r = p
      g = q
      b = v
      break
    case 4: 
      r = t
      g = p
      b = v
      break
    case 5: 
      r = v
      g = p
      b = q
      break
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}
const downloader = document.createElement('a')

let i = 0
let refreshComputing = () => {
  Document.refreshCanvas()
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

      let color = diverged ? 0 : 255 * iterations / (15 * (i + 1) ** 0.9)
      let index = (ix + iy * imageData.width) * 4
      let hsv = rgbToHsv(color - 23, color - 511, color + 31)
      hsv[0] += (18 * i) % 360
      let [r, g, b] = hsvToRgb(...hsv)
      
      imageData.data[index + 0] = r
      imageData.data[index + 1] = g
      imageData.data[index + 2] = b
      imageData.data[index + 3] = 255
    }
  }
  /*let png = Document.canvas.canvas.toDataURL('image/png')
  downloader.href = png
  downloader.download = `frame${i}.png`
  downloader.click()*/
}

Document.refreshCanvas()
refreshComputing()
Rect.draw({
  x: 0, y: 0,
  width: Document.width, height: Document.height,
}).fill('#ffffff')
Document.canvas.ctx.putImageData(imageData, 0, 0)

let time = 0
let tick = 0
let appLoop = async (newTime) => {
  let timeElapsed = newTime - time
  time = newTime
  tick++

  if (tick % 10 === 0 && i < 97) {
    i++
    refreshComputing()
    Rect.draw({
      x: 0, y: 0,
      width: Document.width, height: Document.height,
    }).fill('#ffffff')
    Document.canvas.ctx.putImageData(imageData, 0, 0)
  }
  Document.refreshCanvas(timeElapsed)
  requestAnimationFrame(appLoop)
}
requestAnimationFrame(appLoop)
