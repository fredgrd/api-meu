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
exports.fetchFriendRequests = exports.updateFriendRequest = exports.createFriendRequest = void 0;
const errors_1 = require("../database/models/errors");
const friendRequest_1 = require("../database/models/friendRequest");
const user_1 = require("../database/models/user");
const authenticateUser_1 = __importDefault(require("../helpers/authenticateUser"));
const notificationService_1 = require("../services/notificationService");
var FriendRequestError;
(function (FriendRequestError) {
    FriendRequestError["SameUser"] = "You can't send a request to yourself";
    FriendRequestError["ReceiverDoesNotExist"] = "The contact is not a user";
    FriendRequestError["AlreadyFriends"] = "You are already friends";
    FriendRequestError["AlreadySent"] = "The request is still pending";
    FriendRequestError["AlreadyHandled"] = "This request was already handled";
})(FriendRequestError || (FriendRequestError = {}));
/**
 * Creates a friend request.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const createFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'FriendRequestController/createFriendRequest');
    if (!authToken)
        return;
    const to = req.body.to;
    if (typeof to !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    if (authToken.number == to) {
        res.status(400).send(FriendRequestError.SameUser);
        return;
    }
    try {
        // Check the receiver is actually a user
        const sender = yield user_1.User.findById(authToken.id)
            .select('name avatar_url')
            .orFail();
        const receiver = yield user_1.User.findOne({ number: to })
            .select('id name avatar_url friends fcm_token')
            .orFail();
        const friends = receiver.friends;
        if (friends.map((e) => String(e._id)).includes(authToken.id)) {
            res.status(400).send(FriendRequestError.AlreadyFriends);
            return;
        }
        let request = yield friendRequest_1.FriendRequest.findOne({
            from: authToken.number,
            to: to,
        });
        if (request && request.status === 'pending') {
            res.status(400).send(FriendRequestError.AlreadySent);
            return;
        }
        request = yield friendRequest_1.FriendRequest.create({
            from: authToken.number,
            from_user: authToken.id,
            to: to,
            to_user: receiver._id,
            status: 'pending',
        });
        const notificationService = new notificationService_1.NotificationService();
        notificationService.notifyFriendRequest(sender.name, receiver.fcm_token || '');
        res.status(200).json({
            id: request.id,
            from: authToken.number,
            from_user: {
                name: sender.name,
                avatar_url: sender.avatar_url,
            },
            to: request.to,
            to_user: {
                name: receiver.name,
                avatar_url: receiver.avatar_url,
            },
        });
        return;
    }
    catch (error) {
        const mongooseError = error;
        console.log(`FriendRequestController/createFriendRequest error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
        return;
    }
});
exports.createFriendRequest = createFriendRequest;
/**
 * Updates a friend request.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const updateFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'FriendRequestController/updateFriendRequest');
    if (!authToken)
        return;
    const requestID = req.body.request_id;
    const update = req.body.update;
    if (typeof requestID !== 'string' || typeof update !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    try {
        const request = yield friendRequest_1.FriendRequest.findById(requestID).orFail();
        if (request.status !== 'pending') {
            res.status(400).send(FriendRequestError.AlreadyHandled);
            return;
        }
        if (update === 'accept') {
            const sender = yield user_1.User.findById(request.from_user).orFail();
            const receiver = yield user_1.User.findById(request.to_user).orFail();
            const senderFriends = receiver.friends;
            const receiverFriends = receiver.friends;
            if (senderFriends.includes(receiver._id) ||
                receiverFriends.includes(sender._id)) {
                res.status(400).send(FriendRequestError.AlreadyFriends);
                return;
            }
            sender.friends.push(receiver.id);
            receiver.friends.push(sender.id);
            yield sender.save();
            yield receiver.save();
            request.status = 'accepted';
            yield request.save();
        }
        else {
            request.status = 'rejected';
            yield request.save();
        }
        res.status(200).send('OK');
    }
    catch (error) {
        const mongooseError = error;
        console.log(`FriendRequestController/updateFriendRequest error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.updateFriendRequest = updateFriendRequest;
/**
 * Fetch friend requests.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const fetchFriendRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'FriendRequestController/fetchFriendRequests');
    if (!authToken)
        return;
    try {
        const pendingRequests = yield friendRequest_1.FriendRequest.find({
            status: 'pending',
            $or: [{ to: authToken.number }, { from: authToken.number }],
        })
            .populate('from_user to_user', { _id: 0, name: 1, avatar_url: 1 })
            .select({ _id: 1, from: 1, from_user: 1, to: 1, to_user: 1, status: 1 });
        const result = pendingRequests.map((e) => ({
            id: e.id,
            from: e.from,
            from_user: e.from_user,
            to: e.to,
            to_user: e.to_user,
        }));
        res.status(200).json(result);
    }
    catch (error) {
        const mongooseError = error;
        console.log(`FriendRequestController/fetchFriendRequests error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.fetchFriendRequests = fetchFriendRequests;
