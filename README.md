# Pitch detection

Tune your guitar.

See [demo](https://nodekoko.com/tuner) based on html5 using ```getUserMedia``` and ```AnalyzerNode```

## How to use

- clone
- serve ```src``` folder via https. You may use ```node app.js``` which will serve the src files over http but for localhost

## How it works

- Finds onset (starting of a note)
- Then attempt to find pitch using yin and fft.js (respectively from repo [pitchfinder](https://github.com/peterkhayes/pitchfinder) and [fft.js](https://github.com/indutny/fft.js/))

