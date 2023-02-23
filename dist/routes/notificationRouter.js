"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const notificationService_1 = require("../services/notificationService");
const router = (0, express_1.Router)();
exports.notificationRouter = router;
router.get('/fetch', notificationController_1.fetchNotifications);
router.patch('/update', notificationController_1.updateNotification);
router.post('/test', (req, res) => {
    const services = new notificationService_1.NotificationService();
    services.test();
    res.sendStatus(200);
});
