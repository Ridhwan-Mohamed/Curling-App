socket.on('homeSet', function(message){
  document.getElementById("JoinAsHomeButton").disabled = true
})

socket.on('homeReset', function(message){
  console.log("UNLOADED")
  document.getElementById("JoinAsHomeButton").disabled = false
})

socket.on('visitorSet', function(message){
  document.getElementById("JoinAsVisitorButton").disabled = true
})

socket.on('visitorReset', function(message){
  console.log("UNLOADED")
  document.getElementById("JoinAsVisitorButton").disabled = false
})

function handleJoinAsHomeButton(){
  socket.emit('selected',"")
  home = true
  console.log(`handleJoinAsHomeButton()`)
  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  socket.emit('home', "")
  if(!isHomePlayerAssigned){
    isHomePlayerAssigned = true
    isHomeClient = true
  }
}

function handleJoinAsVisitorButton(){
  socket.emit('selected',"")
  away = true
  console.log(`handleJoinAsVisitorButton()`)
  let btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  socket.emit('visitor', "")
  if(!isVisitorPlayerAssigned) {
    isVisitorPlayerAssigned = true
    isVisitorClient = true
  }
}

function handleJoinAsSpectatorButton(){
  socket.emit('selected',"")
  console.log(`handleJoinAsSpectatorButton()`)
  let btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  if(!isSpectatorClient) isSpectatorClient = true
}