const fs = require('fs');
const path = require('path');

// Définir le chemin du fichier de stockage des messages
const messagesFilePath = path.join(__dirname, '..', 'messages.json');

// Charger les messages à partir du fichier
function loadMessages() {
  if (fs.existsSync(messagesFilePath)) {
    const data = fs.readFileSync(messagesFilePath, 'utf-8');
    return JSON.parse(data);
  }
  return {};
}

// Sauvegarder un message dans le fichier
function saveMessage(roomKey, message) {
  const messages = loadMessages();
  if (!messages[roomKey]) {
    messages[roomKey] = [];
  }
  messages[roomKey].push(message);

  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf-8');
}

// Exporter les fonctions pour les utiliser dans d'autres fichiers
module.exports = {
  loadMessages,
  saveMessage
};
