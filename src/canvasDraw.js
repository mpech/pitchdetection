class CanvasDrawer {
  constructor (root) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = root.offsetWidth
    this.canvas.height = 60
    root.appendChild(this.canvas)
    window.onresize = _ => {
      this.canvas.width = root.offsetWidth
      this.w = this.canvas.width
      this.h = this.canvas.height
      this.ctx = this.canvas.getContext('2d')
      this.ctx.fillStyle = 'rgb(200, 200, 200)'
      this.ctx.fillRect(0, 0, this.w, this.h)
    }
    window.onresize()
  }

  draw (dataArray) {
    const ctx = this.ctx
    const bufferLength = dataArray.length
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.fillRect(0, 0, this.w, this.h)

    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgb(0, 0, 0)'

    ctx.beginPath()

    const sliceWidth = this.w * 1.0 / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = v * this.h / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(this.canvas.width, this.canvas.height / 2)
    ctx.stroke()
  }
}
export default CanvasDrawer
