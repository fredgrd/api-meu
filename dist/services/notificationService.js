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
exports.NotificationService = void 0;
const firebase_admin_1 = require("firebase-admin");
const notification_1 = require("../database/models/notification");
const room_1 = require("../database/models/room");
const user_1 = require("../database/models/user");
class NotificationService {
    constructor() {
        this.FCMessaging = (0, firebase_admin_1.messaging)();
    }
    notifyFriendRequest(senderName, fcmToken) {
        return __awaiter(this, void 0, void 0, function* () {
            this.FCMessaging.sendToDevice(fcmToken, {
                notification: {
                    title: 'Friend Request',
                    body: `You have a friend request from ${senderName}`,
                },
            });
        });
    }
    notifyFriends(roomID, ownerID, senderID, message, kind, connectedFriends) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(ownerID).select('friends').orFail();
                // Filter ids
                let ids = user.friends.map((e) => e.toString());
                ids.push(ownerID.toString());
                ids = ids.filter((e) => !connectedFriends.includes(e));
                if (!ids.length) {
                    return;
                }
                // Create notifications
                const notifications = ids.map((e) => {
                    const notification = {
                        room_id: roomID,
                        user_id: e,
                        sender_id: senderID,
                        status: 'sent',
                        message: message,
                        kind: kind,
                    };
                    return notification;
                });
                yield notification_1.Notification.insertMany(notifications);
                const sender = yield user_1.User.findById(senderID).select('name');
                const tokens = yield user_1.User.find({ _id: { $in: ids } }).select('fcm_token');
                let notificationBody;
                switch (kind) {
                    case room_1.IRoomMessageKind.text:
                        notificationBody = message;
                        break;
                    case room_1.IRoomMessageKind.image:
                        notificationBody = 'Sent you an image';
                    case room_1.IRoomMessageKind.audio:
                        notificationBody = 'Sent you an audio';
                }
                this.FCMessaging.sendToDevice(tokens.map((e) => e.fcm_token || ''), {
                    notification: {
                        title: (sender === null || sender === void 0 ? void 0 : sender.name) || '',
                        body: notificationBody,
                        click_action: `com.meu://home?room_id=${roomID}`,
                    },
                });
            }
            catch (error) {
                const mongooseError = error;
                console.log(`NotificationService/notifyFriends error: ${mongooseError.name} ${mongooseError.message}`);
                return;
            }
        });
    }
}
exports.NotificationService = NotificationService;
