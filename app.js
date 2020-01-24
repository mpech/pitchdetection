const fs = require('fs')
const path = require('path')

require('http').createServer(function (req, res) {
  let fname = req.url.replace(/^\//, '')
  if (fname === '') { fname = 'index.html' }
  if (fname.endsWith('.js')) { res.setHeader('Content-type', 'text/javascript') }
  const f = path.resolve('src', fname)
  return fs.readFile(f, (err, data) => {
    if (err) {
      res.statusCode = 404
      return res.end('nothing ' + f)
    }
    return res.end(data.toString())
  })
}).listen(8000)
console.log('listening on http://localhost:8000')
