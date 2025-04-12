const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const CryptoJS = require('crypto-js'); // Importation de la bibliothèque CryptoJS

// Créer l'application Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Route pour la page principale
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Clé secrète pour crypter et décrypter les messages
const secretKey = 'votre-cle-secrete'; // Utilise une clé plus complexe et sécurisée

// Gérer la connexion des utilisateurs via Socket.io
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Rejoindre une room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`L'utilisateur a rejoint la room: ${room}`);

    // Envoyer l'historique des messages
    socket.emit('history', getHistory(room));
  });

  // Recevoir un message et l'envoyer à tous les membres de la room
  socket.on('message', (msg, room) => {
    // Crypter le message avant de l'envoyer
    const encryptedMessage = CryptoJS.AES.encrypt(msg, secretKey).toString();
    io.to(room).emit('message', encryptedMessage);
    addMessageToHistory(room, encryptedMessage);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('Un utilisateur a quitté');
  });
});

// Port du serveur
server.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});

// Simuler un historique de messages pour une room (à implémenter en base de données)
const history = {};

function getHistory(room) {
  return history[room] || [];
}

function addMessageToHistory(room, msg) {
  if (!history[room]) {
    history[room] = [];
  }
  history[room].push(msg);
}
