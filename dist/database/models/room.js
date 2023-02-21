"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = exports.IRoomMessageKind = void 0;
const mongoose_1 = require("mongoose");
var IRoomMessageKind;
(function (IRoomMessageKind) {
    IRoomMessageKind["text"] = "text";
    IRoomMessageKind["audio"] = "audio";
    IRoomMessageKind["image"] = "image";
})(IRoomMessageKind = exports.IRoomMessageKind || (exports.IRoomMessageKind = {}));
// Schemas
const RoomMessageSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    kind: {
        type: String,
        enum: ['text', 'audio', 'image'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const RoomSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    messages: {
        type: [RoomMessageSchema],
        required: true,
        default: [],
    },
});
// Model
exports.Room = (0, mongoose_1.model)('Room', RoomSchema);
