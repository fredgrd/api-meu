"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// Schemas
const UserSchema = new mongoose_1.Schema({
    fcm_token: {
        type: String,
        required: true,
        default: 'none',
    },
    number: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    avatar_url: {
        type: String,
        required: true,
        default: 'none',
    },
    status: {
        type: String,
        required: true,
        default: '👋',
    },
    friends: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});
// Model
exports.User = (0, mongoose_1.model)('User', UserSchema);
