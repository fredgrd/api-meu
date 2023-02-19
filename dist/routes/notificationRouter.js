"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const router = (0, express_1.Router)();
exports.notificationRouter = router;
router.get('/fetch', notificationController_1.fetchNotifications);
