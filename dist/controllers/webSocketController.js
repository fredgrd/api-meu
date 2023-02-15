"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsOnConnection = void 0;
const ws_1 = require("ws");
const url_1 = require("url");
const room_1 = require("../database/models/room");
const index_1 = require("../index");
const logError_1 = require("../helpers/logError");
const isRoomMessage = (message) => {
    const castedMessage = message;
    return (castedMessage.sender !== undefined && castedMessage.message !== undefined);
};
const isRoomUpdate = (update) => {
    const castedUpdate = update;
    return (castedUpdate.kind !== undefined && castedUpdate.sender_name !== undefined);
};
const brodcastUpdate = (ws, update) => {
    index_1.wss.clients.forEach((wsClient) => {
        const client = wsClient;
        if (client !== ws &&
            client.room_id === ws.room_id &&
            client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(update));
        }
    });
};
const broadcastMessage = (ws, message) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield room_1.Room.findByIdAndUpdate(ws.room_id, {
        $push: {
            messages: { sender: message.sender, message: message.message },
        },
    }, { safe: true, new: true }).catch((e) => {
        (0, logError_1.logMongooseError)(e, 'webSocketController/onMessage');
        return;
    });
    const savedMessage = room === null || room === void 0 ? void 0 : room.messages[(room === null || room === void 0 ? void 0 : room.messages.length) - 1];
    index_1.wss.clients.forEach((wsClient) => {
        const client = wsClient;
        if (client !== ws &&
            client.room_id === ws.room_id &&
            client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify({
                id: savedMessage === null || savedMessage === void 0 ? void 0 : savedMessage._id,
                kind: 'text',
                sender: message.sender,
                sender_name: message.sender_name,
                sender_number: message.sender_number,
                sender_thumbnail: message.sender_thumbnail,
                message: message.message,
                timestamp: savedMessage === null || savedMessage === void 0 ? void 0 : savedMessage.timestamp,
            }));
        }
    });
});
const wsOnConnection = (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    const roomID = (0, url_1.parse)(req.url).query;
    if (typeof roomID === 'string') {
        ws.room_id = roomID;
    }
    else {
        console.log('webSocketController/onConnection error: NoRoom');
        ws.close();
        return;
    }
    ws.on('message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const dataString = data.toString();
        const payload = JSON.parse(dataString);
        if (isRoomUpdate(payload)) {
            brodcastUpdate(ws, payload);
        }
        if (isRoomMessage(payload)) {
            yield broadcastMessage(ws, payload);
        }
    }));
});
exports.wsOnConnection = wsOnConnection;
