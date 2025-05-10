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
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeMessages(messages) {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf8');
}

app.post('/messages', (req, res) => {
  const { name, wa, msg } = req.body;
  if (!name || !msg) {
    return res.status(400).send('Nama dan pesan wajib diisi.');
  }
  const newMessage = { id: Date.now(), name, wa, msg };
  const messages = readMessages();
  messages.push(newMessage);
  writeMessages(messages);
  res.status(200).send('Pesan berhasil disimpan.');
});

app.get('/messages', (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

app.delete('/messages/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id);
  let messages = readMessages();
  const initialLength = messages.length;
  messages = messages.filter(msg => msg.id !== idToDelete);
  if (messages.length < initialLength) {
    writeMessages(messages);
    res.status(200).send('Pesan berhasil dihapus.');
  } else {
    res.status(404).send('Pesan tidak ditemukan.');
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
