import YinFft from './yinfft.js'
const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

function pitchToN (pitch) {
  const n = 12 * (Math.log2(pitch) - Math.log2(440))
  return Math.round(n)
}

function nToPitch (n) {
  return 440 * 2 ** (n / 12)
}

function nToLabel (n) {
  return notes[(n + 5 * notes.length) % notes.length]
}

function getClosestNote (pitch) {
  const n = pitchToN(pitch)
  // const minN = pitchToN(82.41) E low guitar
  const minN = pitchToN(64) // C piano
  const maxN = pitchToN(335)
  if (n < minN || n > maxN) {
    return null
  }
  return nToLabel(n)
}

class TunerACE extends HTMLElement {
  constructor () {
    super()
    const root = this.attachShadow({ mode: 'open' })

    const template = document.createElement('template')
    template.innerHTML = `
    <div>
      <div class="pitch-main"></div>
      <div>
        <input type="range" disabled/>
      </div>
      <div>
        <span class="lower"></span>
        <span class="upper"></span>
      </div>
      <div style="clear:both;"></div>
    </div>
    <style>
input{ width: 100%; margin:0;}
input[type=range]::-webkit-slider-runnable-track, input[type=range]::-moz-range-track{
  width: 99%; /* border make it overflow */
  height: 8.4px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border-radius: 1.3px;
  border: 0.2px solid #010101;


  background: red;
  background: -moz-linear-gradient(90deg, red 0%, yellow 25%, green 51%, yellow 75%, red 100%);
  background: -webkit-gradient(left, right, color-stop(0%, red), color-stop(25%, yellow), color-stop(51%, green), color-stop(75%, yellow), color-stop(100%, red));
  background: -webkit-linear-gradient(90deg, red 0%, yellow 25%, green 51%, yellow 75%, red 100%);
  background: -o-linear-gradient(90deg, red 0%, yellow 25%, green 51%, yellow 75%, red 100%);
  background: -ms-linear-gradient(90deg, red 0%, yellow 25%, green 51%, yellow 75%, red 100%);
  background: linear-gradient(90deg, red 0%, yellow 25%, green 51%, yellow 75%, red 100%);
}
div.pitch-main {
  font-size: 3em;
  text-align:center;
}
.lower { float: left; }
.upper { float: right; }
    </style>`
    root.appendChild(template.content.cloneNode(true))
    this.note = root.querySelector('.pitch-main')
    this.lower = root.querySelector('.lower')
    this.upper = root.querySelector('.upper')
    this.input = root.querySelector('input')
  }

  static get observedAttributes () {
    return ['pitch']
  }

  attributeChangedCallback (name, old, now) {
    if (name === 'pitch') {
      const pitch = parseFloat(now)
      console.log('newpitch', pitch, getClosestNote(pitch))
      if (isNaN(pitch) || !getClosestNote(pitch)) {
        this.lower.innerHTML = '--'
        this.upper.innerHTML = '--'
        this.lower.setAttribute('title', '--')
        this.upper.setAttribute('title', '--')
        return
      }
      const n = pitchToN(pitch)
      const minN = n - 1
      const maxN = n + 1
      this.note.innerHTML = nToLabel(n) + '(' + pitch.toFixed(2) + 'hz)'
      this.lower.setAttribute('title', nToPitch(minN).toFixed(2) + ' hz')
      this.upper.setAttribute('title', nToPitch(maxN).toFixed(2) + ' hz')
      this.lower.innerHTML = nToLabel(minN)
      this.upper.innerHTML = nToLabel(maxN)
      this.input.min = nToPitch(minN)
      this.input.max = nToPitch(maxN)
      this.input.value = pitch
    }
  }
};

customElements.define('my-tuner', TunerACE)

class PitchDrawer {
  constructor (node) {
    this.chunks = []
    this.pitchDrawNode = node
    this.tuner = document.createElement('my-tuner')
    this.tuner.setAttribute('pitch', 100)
    node.appendChild(this.tuner)
    this.started = false
  }

  draw (v) {
    const yin = new YinFft()
    const pitch = yin(v)
    console.log('pitch', pitch)
    this.tuner.setAttribute('pitch', pitch)
  }

  start (arr) {
    this.chunks = [arr]
    this.started = true
  }

  feed (arr) {
    if (!this.started) return
    this.chunks.push(arr)
    const l = this.chunks[0].length
    if (this.chunks.length * l === 32768) {
      const newbuf = new Uint8Array(32768)
      this.chunks.forEach((c, i) => {
        newbuf.set(c, l * i)
      })
      this.draw(newbuf)
      this.started = false
    }
  }
}

export default PitchDrawer
