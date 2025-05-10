const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;
const messagesFile = 'messages.json';

app.use(cors());
app.use(bodyParser.json());

function readMessages() {
  try {
    const data = fs.readFileSync(messagesFile, 'utf8');
    console.log("Server: readMessages - Data:", data);
    return JSON.parse(data);
  } catch (error) {
    console.error("Server: readMessages - Error:", error.message);
    return [];
  }
}

function writeMessages(messages) {
  const jsonData = JSON.stringify(messages, null, 2);
  fs.writeFileSync(messagesFile, jsonData, 'utf8');
  console.log("Server: writeMessages - Data written:", jsonData);
}

app.post('/messages', (req, res) => {
  const { name, wa, msg } = req.body;
  console.log("Server: POST /messages - Received data:", { name, wa, msg });
  if (!name || !msg) {
    console.log("Server: POST /messages - Error: Nama dan pesan wajib diisi");
    return res.status(400).send('Nama dan pesan wajib diisi.');
  }
  const newMessage = { id: Date.now(), name, wa, msg };
  const messages = readMessages();
  messages.push(newMessage);
  writeMessages(messages);
  res.status(200).send('Pesan berhasil disimpan.');
  console.log("Server: POST /messages - Message saved successfully");
});

app.get('/messages', (req, res) => {
  console.log("Server: GET /messages - Request received");
  const messages = readMessages();
  res.json(messages);
  console.log("Server: GET /messages - Messages sent:", messages);
});

app.delete('/messages/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id);
  console.log("Server: DELETE /messages/:id - Received ID:", idToDelete);
  if (isNaN(idToDelete)) {
    console.log("Server: DELETE /messages/:id - Error: Invalid ID");
    return res.status(400).send('ID pesan tidak valid.');
  }
  let messages = readMessages();
  const initialLength = messages.length;
  messages = messages.filter(msg => msg.id !== idToDelete);
  if (messages.length < initialLength) {
    writeMessages(messages);
    res.status(200).send('Pesan berhasil dihapus.');
    console.log("Server: DELETE /messages/:id - Message deleted successfully");
  } else {
    res.status(404).send('Pesan tidak ditemukan.');
    console.log("Server: DELETE /messages/:id - Error: Message not found");
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
