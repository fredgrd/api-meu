"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = require("./database");
const authRouter_1 = require("./routes/authRouter");
const userRouter_1 = require("./routes/userRouter");
const friendRequestRouter_1 = require("./routes/friendRequestRouter");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
// Connect database
(0, database_1.connectDatabase)();
/// Cookie parser
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});
// Auth routes
app.use('/auth', authRouter_1.authRouter);
// User routes
app.use('/user', userRouter_1.userRouter);
// Frient Request routes
app.use('/friend-request', friendRequestRouter_1.friendRequestRouter);
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        console.log(data.toString());
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data.toString());
            }
        });
    });
});
server.listen(process.env.PORT, () => {
    console.log('Server is listening on port 3000');
});
