import CanvasDrawer from './canvasDraw.js'
import PitchDrawer from './pitchDraw.js'
import OnsetDetector from './onsetDetector.js'
class Visualizer {
  constructor () {
    const node = document.querySelector('.time-series')
    this.canvasDrawer = new CanvasDrawer(node)
    this.pitchDrawer = new PitchDrawer(document.querySelector('.tuner'))
    this.onsetDetector = new OnsetDetector()
  }

  start (stream) {
    this.stream = stream
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(stream)
    this.analyser = audioCtx.createAnalyser()
    this.analyser.fftSize = 8192
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    source.connect(this.analyser)
    this._draw()
  }

  _draw () {
    requestAnimationFrame(_ => this._draw())
    this.analyser.getByteTimeDomainData(this.dataArray)
    this.canvasDrawer.draw(this.dataArray)
    if (this.onsetDetector.detect(this.dataArray)) {
      console.log('go', this.dataArray.slice(0, 10))
      this.pitchDrawer.start(this.dataArray)
    } else {
      this.pitchDrawer.feed(this.dataArray)
    }
  }
}
export default Visualizer
