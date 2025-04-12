const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { encrypt, decrypt } = require("./utils/encryption");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" } // Permet à toutes les origines de se connecter
});

app.use(cors());
app.use(express.json());

const messagesFile = path.join(__dirname, "messages", "storage.json");

// Load messages from file
function getRoomMessages(roomKey) {
  if (!fs.existsSync(messagesFile)) return {};
  const data = fs.readFileSync(messagesFile);
  const rooms = JSON.parse(data);
  return rooms[roomKey] || [];
}

// Save messages to file
function saveRoomMessage(roomKey, message) {
  let rooms = {};
  if (fs.existsSync(messagesFile)) {
    const data = fs.readFileSync(messagesFile);
    rooms = JSON.parse(data);
  }
  if (!rooms[roomKey]) rooms[roomKey] = [];
  rooms[roomKey].push(message);
  fs.writeFileSync(messagesFile, JSON.stringify(rooms, null, 2));
}

// API: Récupérer l'historique d'une room
app.get("/history/:roomKey", (req, res) => {
  const roomKey = req.params.roomKey;
  const messages = getRoomMessages(roomKey);
  res.json(messages);
});

// Socket : gérer les connexions
io.on("connection", socket => {
  socket.on("joinRoom", ({ roomKey, username }) => {
    socket.join(roomKey);
    console.log(`${username} joined room ${roomKey}`);
  });

  socket.on("sendMessage", ({ roomKey, username, content }) => {
    const encryptedMessage = encrypt(content); // Encrypting the message
    const message = {
      username,
      content: encryptedMessage,
      timestamp: new Date().toISOString()
    };
    saveRoomMessage(roomKey, message); // Save the message to file
    io.to(roomKey).emit("newMessage", message); // Emit the message to other users in the room
  });
});

// Server start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
