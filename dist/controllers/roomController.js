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
exports.fetchMessages = exports.fetchRoom = exports.fetchRooms = exports.deleteRoom = exports.createRoom = void 0;
const errors_1 = require("../database/models/errors");
const room_1 = require("../database/models/room");
const authenticateUser_1 = __importDefault(require("../helpers/authenticateUser"));
/**
 * Creates a user's room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'RoomController/createRoom');
    if (!authToken)
        return;
    const name = req.body.name;
    const description = req.body.description;
    if (typeof name !== 'string' || typeof description !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    try {
        const room = yield room_1.Room.create({
            user: authToken.id,
            name: name,
            description: description,
            messages: [
                {
                    sender: authToken.id,
                    message: description,
                },
            ],
        });
        res.status(200).json({
            id: room.id,
            user: room.user,
            name: room.name,
            description: room.description,
        });
    }
    catch (error) {
        const mongooseError = error;
        console.log(`RoomController/createRoom error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.createRoom = createRoom;
/**
 * Delets a user's room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'RoomController/deleteRoom');
    if (!authToken)
        return;
    const roomID = req.body.room_id;
    if (typeof roomID !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    try {
        const result = yield room_1.Room.deleteOne({ _id: roomID, user: authToken.id });
        if (result.acknowledged) {
            res.status(200).send('OK');
        }
        else {
            res.status(500).send(errors_1.APIError.Internal);
        }
    }
    catch (error) {
        const mongooseError = error;
        console.log(`RoomController/deleteRoom error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.deleteRoom = deleteRoom;
/**
 * Fetches all the users room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const fetchRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'RoomController/fetchRooms');
    if (!authToken)
        return;
    const userID = req.query.user_id;
    if (typeof userID !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    try {
        const rooms = yield room_1.Room.find({ user: userID }).select('id, user name description');
        res.status(200).json(rooms.map((e) => ({
            id: e.id,
            user: e.user,
            name: e.name,
            description: e.description,
        })));
    }
    catch (error) {
        const mongooseError = error;
        console.log(`RoomController/fetchRooms error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.fetchRooms = fetchRooms;
/**
 * Fetches the room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const fetchRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'RoomController/fetchRoom');
    if (!authToken)
        return;
    const roomID = req.query.room_id;
    if (typeof roomID !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    try {
        const room = yield room_1.Room.findById(roomID)
            .select('id, user name description')
            .orFail();
        res.status(200).json({
            id: room._id,
            user: room.user,
            name: room.name,
            description: room.description,
        });
    }
    catch (error) {
        const mongooseError = error;
        console.log(`RoomController/fetchRoom error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.fetchRoom = fetchRoom;
/**
 * Fetches the room's messages.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
const fetchMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'RoomController/fetchMessages');
    if (!authToken)
        return;
    const roomID = req.query.room_id;
    if (typeof roomID !== 'string') {
        res.status(400).send(errors_1.APIError.NoData);
        return;
    }
    try {
        const room = yield room_1.Room.findById(roomID)
            .select('messages')
            .populate('messages.sender', { name: 1, number: 1, avatar_url: 1 })
            .orFail();
        const messages = room.messages.map((message) => {
            const userDetails = message.sender;
            return {
                id: message._id,
                sender: userDetails._id,
                sender_name: userDetails.name,
                sender_number: userDetails.number,
                sender_thumbnail: userDetails.avatar_url,
                message: message.message,
                timestamp: message.timestamp,
            };
        });
        res.status(200).json(messages);
    }
    catch (error) {
        const mongooseError = error;
        console.log(`RoomController/fetchRooms error: ${mongooseError.name} ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.fetchMessages = fetchMessages;
