
/*
Client-side javascript for 2406 collision geometry demo
(c) Louis D. Nel 2022

This demonstration provides a client-side only application. In this
demonstration the server is used only to serve the application to the client.
Once the application is running on the client the server is no longer involved.

This demonstration is a simulation of collisions based on the game of curling.
Collision dynamics is based on simple geometry (not physics).
Collision events are modelled using a Collision object and these objects are
placed in a Collsion set. This approach is to provide "Debouncing" and to
handle the "Tunneling Problem" common in such simulations.

There are many refactoring opportunies in this code including the following:

1)The shooting area and closeup area share a global co-ordinate system.
It would be better if each has its own local co-ordinate system.

2)Most objects are represented through an ES6 Class. However the main level
canvasWithTimer.js code is not. It would be better for the main level code
to also be represented through a class.

3)The constants and state variables a still a bit scattered through the code
It would be better to centralize them a bit more to re-enforced the MVC
model-view-controller pattern.

4)The code does not take advantage of closures. In many cases parameters
are being passed around which might be made accessible through closures.

5) The code does not take advantage of any modularization features of ES6
nor does it take particular advantage of closures.
Instead the .html file simply includes a <script></script> statement for each
required file. No attempt is made to bundle the files.
*/
let timer //timer for animating motion
let canvas = document.getElementById('canvas1') //our drawing canvas
let iceSurface = new Ice(canvas)

allStones = new SetOfStones() //set of all stones. sorted by lying score
homeStones = new SetOfStones() //set of home stones in no particular order
visitorStones = new SetOfStones() //set of visitor stones in no particular order
shootingQueue = new Queue() //queue of stones still to be shot
let shootingArea = iceSurface.getShootingArea()
let stoneRadius = iceSurface.nominalStoneRadius()

//create stones
for(let i=0; i<STONES_PER_TEAM; i++){
  let homeStone = new Stone(0, 0, stoneRadius, HOME_COLOUR)
  let visitorStone = new Stone(0, 0, stoneRadius, VISITOR_COLOUR)
  homeStones.add(homeStone)
  visitorStones.add(visitorStone)
  allStones.add(homeStone)
  allStones.add(visitorStone)
}

socket.on('accelerate', function(data){
  data = JSON.parse(data)
  whosTurnIsIt = data.turn
  if(whosTurnIsIt === HOME_COLOUR){
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(homeStones.elementAt(i))
      shootingQueue.enqueue(visitorStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    }
  }
  else {
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(visitorStones.elementAt(i))
      shootingQueue.enqueue(homeStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    }
  }

  arr  = data.array
  console.log("ARR")
  console.log(arr)
  for(let i = 0; i < arr.length; i++){
    console.log(shootingQueue.elementAt(i).getColour())
    shootingQueue.elementAt(i).setLocation({x : arr[i].x, y : arr[i].y})
    shotStones.push(shootingQueue.elementAt(i))
  }
  for(let i = 0; i < arr.length; i++){ shootingQueue.dequeue()}
  arr = null
  connected = true
})


function stageStones(){
  //stage the stones in the shooting area by lining them vertically on either side
  //add stones to the shooting order queue based on the value
  //of whosTurnIsIt state variable

  if(whosTurnIsIt === HOME_COLOUR){
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(homeStones.elementAt(i))
      shootingQueue.enqueue(visitorStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    }
  }
  else {
    for(let i=0; i<STONES_PER_TEAM; i++){
      shootingQueue.enqueue(visitorStones.elementAt(i))
      shootingQueue.enqueue(homeStones.elementAt(i))
      homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
      visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    }
  }
  notWait = true;

  console.log("OG QUEUE")
  console.log(shootingQueue)
}

//stageStones()



//console.log(`stones: ${allStones.toString()}`)

let setOfCollisions = new SetOfCollisions()

let stoneBeingShot = null //Stone instance: stone being shot with mouse
let shootingCue = null //Cue instance: shooting cue used to shoot ball with mouse
let cue = null


let fontPointSize = 18 //point size for chord and lyric text
let editorFont = 'Courier New' //font for your editor -must be monospace font

function distance(fromPoint, toPoint) {
  //point1 and point2 assumed to be objects like {x:xValue, y:yValue}
  //return "as the crow flies" distance between fromPoint and toPoint
  return Math.sqrt(Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2))
}

function drawCanvas() {

  const context = canvas.getContext('2d')

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas

  //draw playing surface
  iceSurface.draw(context, whosTurnIsIt)

  context.font = '' + fontPointSize + 'pt ' + editorFont
  context.strokeStyle = 'blue'
  context.fillStyle = 'red'

  //draw the stones
  allStones.draw(context, iceSurface)
  if (shootingCue != null) shootingCue.draw(context)
  else if(cue != null) cue.draw(context)

  //draw the score (as topmost feature).
  iceSurface.drawScore(context, score)
}
