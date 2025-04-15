const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, markNotificationAsRead, deleteNotification } = require('../controllers/notification');
const { authMiddleware } = require("../middlewares/auth");

router.post('/', authMiddleware, createNotification);

router.get('/', authMiddleware, getNotifications);

router.patch('/:notificationId/read', authMiddleware, markNotificationAsRead);

router.delete('/:notificationId', authMiddleware, deleteNotification);

module.exports = router;
