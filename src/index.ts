import express, { Express } from 'express';
import http, { Server } from 'http';
import { WebSocketServer, Server as WSServer } from 'ws';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app: Express = express();
const server: Server = http.createServer(app);
const wss: WSServer = new WebSocketServer({ server });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log(data.toString());
    console.log('WS', ws);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

server.listen(process.env.PORT, () => {
  console.log('Server is listening on port 3000');
});
