/*
COMP 2406 Collision Demo
(c) Louis D. Nel 2018

This example is based on the collision geometry math presented in
assignment #3 (fall 2018).
Some of the variable names (e.g. angle_d) correspond to those
presented in the powerpoint slides with the assignment.

This code is intended to serve as the base code for building
an online multi-player game where clients are kept in synch
through a server -presumably using the socket.io npm module.


Use browser to view pages at http://localhost:3000/collisions.html
*/

//Server Code
const server = require("http").createServer(handler) //need to http
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require("fs") //needed if you want to read and write files
const { SocketAddress } = require("net")
const url = require("url") //to parse url strings

const ROOT_DIR = "html" //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", //should really be application/javascript
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  //Get MIME type based on extension of requested file name
  //e.g. index.html --> text/html
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

server.listen(3000)

function handler(request, response) {
    let urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let receivedData = ""
    let dataObj = null
    let returnObj = null

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
      //Handle the client POST requests
      //console.log('received data: ', receivedData)

      //If it is a POST request then we will check the data.
      if (request.method == "POST") {
        //Do this for all POST messages
        //echo back the data to the client FOR NOW
        dataObj = JSON.parse(receivedData)
        console.log("received data object: ", dataObj)
        console.log("type: ", typeof dataObj)
        console.log("USER REQUEST: " + dataObj.text)
        returnObj = {}
        returnObj.text = dataObj.text
        response.writeHead(200, {
          "Content-Type": MIME_TYPES["json"]
        })
        response.end(JSON.stringify(returnObj))
      }
      else if (request.method == "GET") {
        //handle GET requests as static file requests
        var filePath = ROOT_DIR + urlObj.pathname
        if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html"

        fs.readFile(filePath, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(filePath)
          })
          response.end(data)
        })
      }
    })
}

//cue vector object
let cue = {
  cueTipX : 0,
  cueTipY : 0,
  cueEndX : 0,
  cueEndY : 0
}
let whosStarted = 'red'
let cueArr = []
let obj = {}
let room = []
io.on('connection', function(socket) {

  for(const [key, value] of Object.entries(obj)){
    if(value == 'home'){
      io.to(socket.id).emit('homeSet')
    }
    if(value == 'visitor'){
      io.to(socket.id).emit('visitorSet')
    }
  }
  
  socket.on("selected", function(data){
    if(room.indexOf(socket.id) == -1){
      console.log("NEW SOCKET")
      let dat = JSON.stringify({turn : whosStarted, array : cueArr})
      io.to(socket.id).emit('accelerate', dat)
      socket.join("in")
      room.push(socket.id)
    }
  })

  socket.on('stone', function(data){
    cueArr = JSON.parse(data).arr
    if(cueArr.length >= 8){
      cueArr = []
    }
    console.log("pushed: " + data)
    console.log("CUEARR: "+cueArr)
    console.log("LENGTH: "+cueArr.length)
  })

  socket.on('turn', function(data){
    whosStarted = JSON.parse(data).turn
    console.log("turn: "+whosStarted)
  })  
  socket.on('home', function(data){
    obj[socket.id+'h'] = 'home'
    io.emit('homeSet')
  })
  socket.on('visitor', function(data){
    obj[socket.id+'v'] = 'visitor'
    io.emit('visitorSet')
  })
  socket.on('cueStart_s', function(data){
    console.log(data)
    pData = JSON.parse(data)
    cue.cueTipX = pData.x
    cue.cueTipY = pData.y
    socket.broadcast.to("in").emit("cueStart",data)
  })
  socket.on('updateCue_s', function(data){
    console.log(data)
    pData = JSON.parse(data)
    cue.cueEndX = pData.x
    cue.cueEndY = pData.y
    socket.broadcast.to("in").emit("updateCue",data)
  })
  socket.on('cueEnd_s', function(data){
    console.log(data)
    cueArr.push(cue)
    cue = {
      cueTipX : 0,
      cueTipY : 0,
      cueEndX : 0,
      cueEndY : 0
    }
    socket.broadcast.to("in").emit("cueEnd",data)
  })
  socket.on("disconnect", function() {
    console.log("home Obj[id] = "+obj[socket.id+'h'])
    console.log("visit Obj[id] = "+obj[socket.id+'v'])

    if(obj[socket.id+'v'] == 'visitor'){
      console.log("VISITOR CONF")
      io.emit('visitorReset', "")
      delete obj[socket.id+'v']
    }
    if(obj[socket.id+'h'] == 'home'){
      console.log("HOME CONF")
      io.emit('homeReset', "")
      delete obj[socket.id+'h']
    }
  })
})


console.log("Server Running at PORT 3000  CNTL-C to quit")
console.log("To Test")
console.log("http://localhost:3000/curling.html")
