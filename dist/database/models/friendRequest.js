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
    to: {
        type: String,
        required: true,
    },
});
// Model
exports.FriendRequest = (0, mongoose_1.model)('FriendRequest', FriendRequestSchema);
