'use strict'

/*
  Copyright (C) 2003-2009 Paul Brossier <piem@aubio.org>
  This file is part of aubio.
  aubio is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  aubio is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with aubio.  If not, see <http://www.gnu.org/licenses/>.
*/

/* This algorithm was developed by A. de Cheveigné and H. Kawahara and
 * published in:
 *
 * de Cheveigné, A., Kawahara, H. (2002) "YIN, a fundamental frequency
 * estimator for speech and music", J. Acoust. Soc. Am. 111, 1917-1930.
 *
 * see http://recherche.ircam.fr/equipes/pcm/pub/people/cheveign.html
 */
import FFT from './fft.js'
function corr (ix, pad = false) {
  let x
  // normally x should be zero concatenated to next power of 2.
  // e.g [1,2,3,4] => [1,2,3,4,0,0,0,0]
  // then get back the first 4 values of corr([1,2,3,4,0,0,0,0])
  // Experimentally though, not padding still gets better result... for E low
  if (pad || pad === 0) {
    x = new Uint8Array(ix.length * 2)
    x.fill(typeof (pad) === 'number' ? pad : 0)
    x.set(ix)
  } else {
    x = ix
  }

  const f = new FFT(x.length)
  const out = f.createComplexArray()
  f.realTransform(out, x)
  f.completeSpectrum(out)
  for (let i = 0; i < x.length * 2; i += 2) {
    const a = out[i]
    const b = out[i + 1]
    out[i] = a * a + b * b
    out[i + 1] = 0 // zz_bar is real
  }
  const back = f.createComplexArray()
  f.inverseTransform(back, out)
  const res = back.filter((x, i) => i % 2 === 0)
  if (typeof pad !== 'undefined') {
    return res.slice(0, ix.length)
  }
  return res
}

function computeDiff (x, corr) {
  const bufferSize = x.length
  const yinBuffer = new Float32Array(bufferSize)
  const cs = new Float32Array(bufferSize)
  let s = 0
  for (let i = 0; i < bufferSize; ++i) {
    s += x[i] * x[i]
    cs[i] = s
  }
  const res = corr(x)
  for (let t = 1; t < bufferSize; ++t) {
    yinBuffer[t] = cs[bufferSize - 1 - t] + s - cs[t - 1] - 2 * res[t]
  }

  return yinBuffer
}

function Yinfft () {
  var DEFAULT_THRESHOLD = 0.1
  var DEFAULT_SAMPLE_RATE = 44100
  var DEFAULT_PROBABILITY_THRESHOLD = 0.1

  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}

  var threshold = config.threshold || DEFAULT_THRESHOLD
  var sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE
  var probabilityThreshold = config.probabilityThreshold || DEFAULT_PROBABILITY_THRESHOLD

  function YINDetector (audioBuffer) {
    'use strict'

    // Set buffer size to the highest power of two below the provided buffer's length.

    /* var bufferSize = void 0
    for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2) {}
    bufferSize /= 2 */
    const bufferSize = audioBuffer.length

    // Set up the yinBuffer as described in step one of the YIN paper.
    var yinBufferLength = bufferSize

    var probability = void 0
    var tau = void 0
    // Compute the difference function as described in step 2 of the YIN paper.
    const yinBuffer = Yinfft.computeDiff(
      audioBuffer.slice(0, bufferSize),
      Yinfft.corr
    )

    // Compute the cumulative mean normalized difference as described in step 3 of the paper.
    yinBuffer[0] = 1
    yinBuffer[1] = 1
    var runningSum = 0
    for (var _t2 = 1; _t2 < yinBufferLength; _t2++) {
      runningSum += yinBuffer[_t2]
      yinBuffer[_t2] *= _t2 / runningSum
    }

    // Compute the absolute threshold as described in step 4 of the paper.
    // Since the first two positions in the array are 1,
    // we can start at the third position.
    for (tau = 2; tau < yinBufferLength; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++
        }

        // found tau, exit loop and return
        // store the probability
        // From the YIN paper: The threshold determines the list of
        // candidates admitted to the set, and can be interpreted as the
        // proportion of aperiodic power tolerated
        // within a periodic signal.
        //
        // Since we want the periodicity and and not aperiodicity:
        // periodicity = 1 - aperiodicity
        probability = 1 - yinBuffer[tau]
        break
      }
    }
    // if no pitch found, return null.
    if (tau == yinBufferLength || yinBuffer[tau] >= threshold) {
      return null
    }

    // If probability too low, return -1.
    if (probability < probabilityThreshold) {
      return null
    }
    console.log('buflen', tau, yinBuffer)
    /**
     * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
     * value using parabolic interpolation. This is needed to detect higher
     * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
     * for more background
     * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
     */
    var betterTau = void 0
    var x0 = void 0
    var x2 = void 0
    if (tau < 1) {
      x0 = tau
    } else {
      x0 = tau - 1
    }
    if (tau + 1 < yinBufferLength) {
      x2 = tau + 1
    } else {
      x2 = tau
    }
    if (x0 === tau) {
      if (yinBuffer[tau] <= yinBuffer[x2]) {
        betterTau = tau
      } else {
        betterTau = x2
      }
    } else if (x2 === tau) {
      if (yinBuffer[tau] <= yinBuffer[x0]) {
        betterTau = tau
      } else {
        betterTau = x0
      }
    } else {
      var s0 = yinBuffer[x0]
      var s1 = yinBuffer[tau]
      var s2 = yinBuffer[x2]
      // fixed AUBIO implementation, thanks to Karl Helgason:
      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
    }

    return sampleRate / betterTau
  }
  return YINDetector
};
Yinfft.corr = corr
Yinfft.computeDiff = computeDiff
export default Yinfft
