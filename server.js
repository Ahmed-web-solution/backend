const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let cameraClient = null;
const viewers = new Set();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        if (message === 'camera') {
            cameraClient = ws;
            console.log('Camera client connected');
        } else if (message === 'viewer') {
            viewers.add(ws);
            console.log('Viewer client connected');
        } else if (cameraClient && ws === cameraClient) {
            // Forward video frames to all viewers
            viewers.forEach((viewer) => {
                if (viewer.readyState === WebSocket.OPEN) {
                    viewer.send(message);
                }
            });
        }
    });

    ws.on('close', () => {
        if (ws === cameraClient) {
            cameraClient = null;
            console.log('Camera client disconnected');
        } else {
            viewers.delete(ws);
            console.log('Viewer client disconnected');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
