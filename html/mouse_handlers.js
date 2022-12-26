let prevStone = null

function getCanvasMouseLocation(e) {
  //provide the mouse location relative to the upper left corner
  //of the canvas

  /*
  This code took some trial and error. If someone wants to write a
  nice tutorial on how mouse-locations work that would be great.
  */
  let rect = canvas.getBoundingClientRect()

  //account for amount the document scroll bars might be scrolled

  //get the scroll offset
  const element = document.getElementsByTagName("html")[0]
  let scrollOffsetX = element.scrollLeft
  let scrollOffsetY = element.scrollTop

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

function handleMouseDown(e) {
  if(enableShooting === false) return //cannot shoot when stones are in motion
  if(!isClientFor(whosTurnIsIt)) return //only allow controlling client

  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y
  //console.log("mouse down:" + canvasX + ", " + canvasY)

  stoneBeingShot = allStones.stoneAtLocation(canvasX, canvasY)

  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      if(shootingQueue.isEmpty()) stageStones()
      //console.log(`shooting from crosshair`)
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(canvasMouseLoc)
      //we clicked near the shooting crosshair
    }
  }

  if (stoneBeingShot != null) {
    shootingCue = new Cue(canvasX, canvasY)
    let obj = {x:canvasX, y:canvasY, mouseloc: canvasMouseLoc}
    socket.emit("cueStart_s", JSON.stringify(obj))
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)

  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  drawCanvas()
}

function handleMouseMove(e) {


  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  //console.log("mouse move: " + canvasX + "," + canvasY)

  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
    let obj = {x:canvasX, y:canvasY}
    socket.emit("updateCue_s", JSON.stringify(obj))
  }

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
  //console.log("mouse up")
  e.stopPropagation()
  if (shootingCue != null) {
    socket.emit("cueEnd_s")
    let cueVelocity = shootingCue.getVelocity()
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    shootingCue = null
    prevStone = shootingQueue.dequeue()
    enableShooting = false //disable shooting until shot stone stops
  }

  //remove mouse move and mouse up handlers but leave mouse down handler
  document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove)
  document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp)

  drawCanvas() //redraw the canvas
}

socket.on("cueStart", function(data){
  obj = JSON.parse(data)
  console.log(obj)

  stoneBeingShot =allStones.stoneAtLocation(obj.x, obj.y)
  let canvasMouseLoc = obj.mouseloc


  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      if(shootingQueue.isEmpty()) stageStones()
      //console.log(`shooting from crosshair`)
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(canvasMouseLoc)
      //we clicked near the shooting crosshair
    }
  }

  if (stoneBeingShot != null) {
    cue = new Cue(obj.x, obj.y)
  }

  drawCanvas()
})

socket.on("updateCue", function(data){
  obj = JSON.parse(data)
  console.log(obj)
  cue.setCueEnd(obj.x, obj.y)
  console.log(canvas)

  drawCanvas()
})

socket.on("cueEnd", function(data){

  if (cue != null) {
    let cueVelocity = cue.getVelocity()
    console.log("cueVelocity" + cueVelocity)
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    cue = null
    prevStone = shootingQueue.dequeue()
    enableShooting = false //disable shooting until shot stone stops
  }

  drawCanvas() //redraw the canvas
})