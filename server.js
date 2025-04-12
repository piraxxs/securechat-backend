require('dotenv').config();  // Charger les variables d'environnement

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { saveMessage, loadMessages } = require('./utils/messageHandler');  // Importer le gestionnaire de messages

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",  // Permettre les connexions provenant de n'importe où
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Lorsque le client se connecte, il charge l'historique des messages
io.on('connection', (socket) => {
  console.log('Un client est connecté');

  // Lorsque le client rejoint une room
  socket.on('joinRoom', ({ roomKey, username }) => {
    socket.join(roomKey);
    console.log(`${username} a rejoint la room ${roomKey}`);

    // Charger l'historique des messages pour la room et les envoyer au client
    const messages = loadMessages();
    socket.emit('loadHistory', { messages: messages[roomKey] || [] });
  });

  // Lorsque le client envoie un message
  socket.on('sendMessage', ({ roomKey, username, message }) => {
    const timestamp = new Date().toISOString();
    const msg = { username, message, timestamp };

    // Sauvegarder le message dans la room
    saveMessage(roomKey, msg);

    // Diffuser le message à tous les clients dans la room
    io.to(roomKey).emit('newMessage', { username, message, timestamp });
  });

  socket.on('disconnect', () => {
    console.log('Un client est déconnecté');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur WebSocket écoute sur le port ${PORT}`);
});
