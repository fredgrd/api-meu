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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNotifications = void 0;
const errors_1 = require("../database/models/errors");
const notification_1 = require("../database/models/notification");
const authenticateUser_1 = __importDefault(require("../helpers/authenticateUser"));
const fetchNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'NotificationController/fetchNotifications');
    if (!authToken)
        return;
    try {
        const notifications = yield notification_1.Notification.find({
            user_id: authToken.id,
        })
            .populate('sender_id', { name: 1, avatar_url: 1 })
            .populate('room_id', { name: 1 });
        const result = notifications.map((e) => {
            const userDetails = e.sender_id;
            const roomDetails = e.room_id;
            return {
                id: e.id,
                room_id: roomDetails._id.toString(),
                room_name: roomDetails.name,
                user_id: e.user_id.toString(),
                sender_id: userDetails._id.toString(),
                sender_name: userDetails.name,
                sender_avatar: userDetails.avatar_url,
                fcm_id: e.fcm_id,
                status: e.status,
                message: e.message,
                type: e.type,
            };
        });
        res.status(200).json(result);
    }
    catch (error) {
        const mongooseError = error;
        console.log(`NotificationController/fetchNotifications error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.fetchNotifications = fetchNotifications;
