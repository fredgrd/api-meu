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
exports.updateFriendRequest = exports.createFriendRequest = void 0;
const errors_1 = require("../database/models/errors");
const friendRequest_1 = require("../database/models/friendRequest");
const user_1 = require("../database/models/user");
const authenticateUser_1 = __importDefault(require("../helpers/authenticateUser"));
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
        res.status(400).send('SameUser');
        return;
    }
    try {
        // Check the receiver is actually a user
        const receiver = yield user_1.User.findOne({ number: to }).select('id name avatar_url');
        if (!receiver) {
            res.status(400).send('ReceiverDoesNotExist');
            return;
        }
        let request = yield friendRequest_1.FriendRequest.findOne({
            from: authToken.number,
            to: to,
        });
        if (request) {
            res.status(400).send('AlreadySent');
            return;
        }
        request = yield friendRequest_1.FriendRequest.create({
            from: authToken.number,
            from_user: authToken.id,
            to: to,
            to_user: receiver._id,
        });
        res.status(200).json({
            id: request.id,
            from: authToken.number,
            to: request.to,
            name: receiver.name,
            avatar_url: receiver.avatar_url,
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
        if (update === 'accept') {
            const sender = yield user_1.User.findById(request.from_user).orFail();
            const receiver = yield user_1.User.findById(request.to_user).orFail();
        }
        else {
        }
    }
    catch (error) {
        const mongooseError = error;
        console.log(`FriendRequestController/updateFriendRequest error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.updateFriendRequest = updateFriendRequest;
