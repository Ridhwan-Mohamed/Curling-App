document.addEventListener('DOMContentLoaded', function() {
  //This is called after the browswer has loaded the web page

  //add mouse down listener to our canvas object
  document.getElementById('canvas1').addEventListener('mousedown', handleMouseDown)

  //add key handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  //add button handlers
  //add listener to submit button
  document.getElementById('JoinAsHomeButton').addEventListener('click', handleJoinAsHomeButton)
  document.getElementById('JoinAsVisitorButton').addEventListener('click', handleJoinAsVisitorButton)
  document.getElementById('JoinAsSpectatorButton').addEventListener('click', handleJoinAsSpectatorButton)


  const MILLISECONDS = 5
  timer = setInterval(handleTimer, MILLISECONDS) //animation timer
  //clearTimeout(timer); //to stop timer

  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor = HOME_PROMPT_COLOUR
  btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor= VISITOR_PROMPT_COLOUR
  btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor= SPECTATOR_PROMPT_COLOUR



  drawCanvas()
})
