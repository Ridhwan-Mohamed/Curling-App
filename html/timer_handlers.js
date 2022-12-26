function handleTimer() {

  allStones.advance(iceSurface.getShootingArea())
  for (let stone1 of allStones.getCollection()) {
    for (let stone2 of allStones.getCollection()) {
      //check for possible collisions
      if ((stone1 !== stone2) && stone1.isTouching(stone2) && (stone1.isStoneMoving() || stone2.isStoneMoving())) setOfCollisions.addCollision(new Collision(stone1, stone2))
    }
  }

  setOfCollisions.removeOldCollisions()

  if(prevStone != null && allStones.isAllStonesStopped()){
    shotStones.push(prevStone)
    let stonePos = []
    for(let i = 0; i < shotStones.length; i++){
      stonePos.push(shotStones[i].getLocation())
    }
    socket.emit('stone', JSON.stringify({arr : stonePos}))
    prevStone = null
  }

  if(allStones.isAllStonesStopped()){
    if(!shootingQueue.isEmpty()) whosTurnIsIt = shootingQueue.front().getColour()
    score = iceSurface.getCurrentScore(allStones)
    enableShooting = true
  }

  if(allStones.isAllStonesStopped() && shootingQueue.isEmpty() && connected){
    shotStones = []
    if(score.home <= score.visitor){
      whosTurnIsIt = VISITOR_COLOUR
    }
    else{
      whosTurnIsIt = HOME_COLOUR
    }
    socket.emit('turn', JSON.stringify({turn : whosTurnIsIt}))
  }
  

  drawCanvas()
}
