import Visualizer from './visualizer.js'

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported')
  const visualizer = new Visualizer()
  const onSuccess = function (stream) {
    visualizer.start(stream)
  }

  const onError = function (err) {
    console.log('The following error occured: ' + err)
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(onSuccess, onError)
} else {
  console.log('getUserMedia not supported on your browser!')
}
