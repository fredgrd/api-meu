import express, { Express } from 'express';
import http, { Server } from 'http';
import { WebSocketServer, WebSocket, Server as WSServer } from 'ws';
import cookieparser from 'cookie-parser';
import bodyParser from 'body-parser';

import { connectDatabase } from './database';

import { authRouter } from './routes/authRouter';
import { userRouter } from './routes/userRouter';
import { friendRequestRouter } from './routes/friendRequestRouter';
import { roomRouter } from './routes/roomRouter';
import { wsOnConnection } from './controllers/webSocketController';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app: Express = express();
const server: Server = http.createServer(app);
export const wss: WSServer = new WebSocketServer({
  server,
  path: '/websockets/room',
});

// Connect database
connectDatabase();

/// Cookie parser
app.use(cookieparser());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

// Auth routes
app.use('/auth', authRouter);

// User routes
app.use('/user', userRouter);

// Frient Request routes
app.use('/friend-request', friendRequestRouter);

// Room routes
app.use('/room', roomRouter);

wss.on('connection', wsOnConnection);

// (ws) => {
//   const extWs = ws as ExtWebSocket;
//   extWs.on('message', (data) => {
//     const body = JSON.parse(data.toString());

//     extWs.room_id = String(Math.random());

//     wss.clients.forEach((client) => {
//       const extClient = client as ExtWebSocket;

//       console.log('CLIENT ROOM', extClient.room_id);

//       if (client !== extWs && client.readyState === WebSocket.OPEN) {
//         client.send(data.toString());
//       }
//     });
//   });
// });

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
