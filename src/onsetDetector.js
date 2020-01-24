class OnsetDetector {
  constructor () {
    this.prev = 0
    this.threeshold = 32
  }

  detect (arr) {
    const old = this.prev
    const nrj = this.signalEnergy(arr)
    this.prev = nrj
    if (nrj >= 2 * old && nrj > 5) {
      return true
    }
    return false
  }

  signalEnergy (arr) {
    let s = 0
    for (let i = 0; i < arr.length; ++i) {
      s += (arr[i] / 128.0 - 1) ** 2
    }
    return s
  }
}
export default OnsetDetector
