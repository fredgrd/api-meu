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
const user_1 = require("../database/models/user");
class NotificationService {
    constructor() {
        this.FCMessaging = (0, firebase_admin_1.messaging)();
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            this.FCMessaging.sendToDevice(' fAMUqQYw0E_NlUl_-n9kja:APA91bHt1PwYsmlgN9pwzeAOtbN2BySvZ3r-UU7IB2EVWIyndGfPAzOBZSynDvrP7qHhYOZYmYDaFmOZTFXPfbXFCrsS3lttrXQfwN90NgvJY85tMKegaK5aSFd-WoxiZb4twCcHLER0', {
                notification: {
                    title: 'Test',
                    body: 'This is a test from server',
                    click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
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
                console.log('NOTIFY THIS USERS', ids);
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
