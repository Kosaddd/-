const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("."));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("createRoom", (name) => {
    const room = Math.random().toString(36).substr(2, 5);
    rooms[room] = [{ name, guess: null, points: 10, id: socket.id }];
    socket.join(room);
    socket.emit("roomJoined", room);
  });

  socket.on("joinRoom", ({ room, playerName }) => {
    if (rooms[room]) {
      rooms[room].push({ name: playerName, guess: null, points: 10, id: socket.id });
      socket.join(room);
      socket.emit("roomJoined", room);
    }
  });

  socket.on("submitGuess", ({ room, name, guess }) => {
    const players = rooms[room];
    if (!players) return;
    const player = players.find(p => p.name === name);
    if (player) player.guess = guess;

    if (players.every(p => p.guess !== null)) {
      const avg = players.reduce((sum, p) => sum + p.guess, 0) / players.length;
      const target = avg * 0.8;
      const winner = players.reduce((a, b) =>
        Math.abs(a.guess - target) < Math.abs(b.guess - target) ? a : b
      );

      players.forEach(p => {
        if (p.name !== winner.name) p.points--;
        if (p.points <= 0) p.eliminated = true;
        p.guess = null;
      });

      io.to(room).emit("results", players.filter(p => !p.eliminated));
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});