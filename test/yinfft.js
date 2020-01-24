import Yinfft from '../src/yinfft'
import assert from 'assert'
describe('yinfft', function () {
  it('correlate1', function () {
    const xcorr = Yinfft.corr(new Uint8Array([1, 2, 3, 4]), 0)
    assert.strictEqual(xcorr.length, 4)
    const exp = [30, 20, 11, 4]
    for (let i = 0; i < exp.length; ++i) {
      assert(Math.abs(exp[i] - xcorr[i]) < 1e-4, xcorr[i])
    }
  })
  it('correlate', function () {
    const xcorr = Yinfft.corr(new Uint8Array([1, 2, 3, 4, 0, 0, 0, 0]), 0)
    assert.strictEqual(xcorr.length, 8)
    const exp = [30, 20, 11, 4]
    for (let i = 0; i < exp.length; ++i) {
      assert(Math.abs(exp[i] - xcorr[i]) < 1e-4)
    }
  })
  it('computeDiff', function () {
    const diff = Yinfft.computeDiff(new Uint8Array([1, 2, 3, 4]), v => {
      return [30, 20, 11, 4]
    })
    const exp = [0, 3, 8, 9]
    for (let i = 0; i < exp.length; ++i) {
      assert(Math.abs(exp[i] - diff[i]) < 1e-4)
    }
  })
  it('correlates for big array', function() {
    const a = new Uint8Array(32768)
    for (let i = 0; i < a.length; ++i) {
      a[i] = (1 + i ) % 7
    }
    let s = 0
    const out = Yinfft.corr(a, 0)
    for (let i = 0; i < out.length; ++i) {
      s += out[i] / out.length
    }
    assert(Math.abs(147456 - s) < 1)
  })
})
