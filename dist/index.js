"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
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
