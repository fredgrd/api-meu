"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    room_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fcm_id: {
        type: String,
        required: true,
        default: 'none',
    },
    status: {
        type: String,
        required: true,
        enum: ['sent', 'read'],
        default: 'sent',
    },
    message: {
        type: String,
        required: true,
    },
    kind: {
        type: String,
        required: true,
        enum: ['text', 'image', 'audio'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
