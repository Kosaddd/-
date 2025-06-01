const socket = io();
let currentRoom = '';
let playerName = '';

function createRoom() {
  playerName = document.getElementById("playerName").value;
  socket.emit("createRoom", playerName);
}

function joinRoom() {
  const room = document.getElementById("roomId").value;
  playerName = document.getElementById("playerName").value;
  socket.emit("joinRoom", { room, playerName });
}

function submitGuess() {
  const guess = parseFloat(document.getElementById("playerGuess").value);
  socket.emit("submitGuess", { room: currentRoom, name: playerName, guess });
}

socket.on("roomJoined", (room) => {
  currentRoom = room;
  document.getElementById("room-info").textContent = "ห้อง: " + room;
  document.getElementById("room-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
});

socket.on("results", (data) => {
  let html = "<h3>ผลลัพธ์</h3>";
  data.forEach(d => {
    html += `<p>${d.name}: ${d.guess} (${d.points} แต้ม)</p>`;
  });
  document.getElementById("results").innerHTML = html;
});