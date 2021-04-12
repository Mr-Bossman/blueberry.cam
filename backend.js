const express = require('express');
const app = express();
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var PubSub = require("pubsub-js");
var net = require("net");
var connections = 0
var client = new net.Socket();
const boundaryID = "BOUNDRY";
app.get('/', (req, res, next) => {
  res.sendfile('./index.html');
})
app.get('/image', (req, res, next) => {
  res.sendfile('./image.gif');
})
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

app.get('/vid.jpg', function(req, res) {

    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace;boundary="' + boundaryID + '"',
        'Connection': 'keep-alive',
        'Expires': 'Fri, 27 May 1977 00:00:00 GMT',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
    });
    if (connections == 0) {
        start();
    }
    connections++;
    console.log("Start: " + connections);


    var sub = PubSub.subscribe('MJPEG', function(msg, data) {

        //console.log(data.length);

        res.write('--' + boundaryID + '\r\n')
        res.write('Content-Type: image/jpeg\r\n');
        res.write('Content-Length: ' + data.length + '\r\n');
        res.write("\r\n");
        res.write(data, 'binary');
        res.write("\r\n");
    });

    res.on('close', function() {
        connections--;
        if (connections == 0) {
            end();
        }
        console.log("End: " + connections);
        PubSub.unsubscribe(sub);
        res.end();
    });
});
function ff(){
    return ffmpeg('tcp://localhost:1935').inputFormat("mpegts").inputOptions("-listen 1").videoBitrate('1024k').outputFormat("mjpeg").fps(30).size('720x480').addOptions("-q:v 7");
}
var command = ff();
var ffstream = command.pipe();
ffstream.on('data', function(chunk) {
    PubSub.publish('MJPEG', chunk);
});
function restart (){
    ffstream.destroy();
    command.kill();
    command = ff();
    ffstream = command.pipe();
    ffstream.on('data', function(chunk) {
        PubSub.publish('MJPEG', chunk);
    });
    ffstream.on("end", restart);
}
ffstream.on("end", restart);

function start() {
    if(client.destroyed){
        client = new net.Socket();
    }
    client.on('error', function(ex) {
        client.destroy();
        client.removeAllListeners();
      });
    client.on('close',function(er){
        client.destroy();
        client.removeAllListeners();
    });
    client.connect(1337, '127.0.0.1', function() {
        client.write('stream');
    });
}

function end() {
    if(!client.destroyed){

        client.write('end');
        client.destroy();
    }
}

app.listen(80);
