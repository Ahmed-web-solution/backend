const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors'); // ✅ Add this line

const app = express();

// ✅ Allow only your frontend's domain (Netlify URL)
app.use(cors({
  origin: 'https://your-app.netlify.app', // <-- yahan apna frontend URL likhna
  methods: ['GET', 'POST'],
  credentials: true,
}));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let viewerSocket = null;

wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    if (ws.role === 'camera') {
      if (viewerSocket && viewerSocket.readyState === WebSocket.OPEN) {
        viewerSocket.send(message);
      }
    } else if (message === 'viewer') {
      ws.role = 'viewer';
      viewerSocket = ws;
    } else if (message === 'camera') {
      ws.role = 'camera';
    }
  });

  ws.on('close', () => {
    if (ws === viewerSocket) {
      viewerSocket = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
