"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRequestRouter = void 0;
const express_1 = require("express");
const friendRequestController_1 = require("../controllers/friendRequestController");
const router = (0, express_1.Router)();
exports.friendRequestRouter = router;
router.post('/create', friendRequestController_1.createFriendRequest);
