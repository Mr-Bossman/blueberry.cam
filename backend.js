const express = require('express');
const app = express();
var fs = require('fs');

app.get('/', (req, res, next) => {
  res.sendfile('./index.html');
})
app.get('/image', (req, res, next) => {
  res.sendfile('./image.gif');
})
app.get('/blueberry', function(req, res) {
  const path = 'sample.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});
app.get('/menu', (req, res, next) => {
  res.sendfile('./menu.png');
})
app.get('/music.mp3', (req, res, next) => {
  res.sendfile('./polkka.mp3');
})
app.get('/about', (req, res, next) => {
  res.sendfile('./info.txt');
})
app.get('/music.ogg', (req, res, next) => {
  res.sendfile('./polkka.ogg');
})
app.get('/icon.png', (req, res, next) => {
  res.sendfile('./icon.png');
})
app.listen(80);
