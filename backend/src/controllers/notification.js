const Notification = require('../models/Notification');

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { userId, message, transactionId, type } = req.body;

        if (!["pickupProposal", "responseToPickup"].includes(type)) {
            return res.status(400).json({ message: "Invalid notification type" });
        }

        const newNotification = new Notification({
            userId,
            message,
            transactionId,
            type
        });

        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create notification' });
    }
};

// Get notifications for the current user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: "read" },  // Update status to "read"
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};

module.exports = { createNotification, getNotifications, markNotificationAsRead, deleteNotification };
