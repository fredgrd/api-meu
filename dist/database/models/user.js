"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// Schemas
const UserSchema = new mongoose_1.Schema({
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
        default: '',
    },
    friends: {
        type: [String],
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});
// Model
exports.User = (0, mongoose_1.model)('User', UserSchema);
