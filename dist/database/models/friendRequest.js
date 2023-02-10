"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequest = void 0;
const mongoose_1 = require("mongoose");
// Schemas
const FriendRequestSchema = new mongoose_1.Schema({
    from: {
        type: String,
        required: true,
    },
    from_user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    to_user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        required: true,
    },
});
// Model
exports.FriendRequest = (0, mongoose_1.model)('FriendRequest', FriendRequestSchema);
