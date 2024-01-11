const Notification = require('../models/notificationModel');
const User = require('../models/userModel');




exports.createNotification = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }

        const createNotification = async (userId) => {
            const notificationData = {
                userId,
                title: req.body.title,
                content: req.body.content,
            };
            return await Notification.create(notificationData);
        };

        if (req.body.total === "ALL") {
            const userData = await User.find({ userType: req.body.sendTo });
            if (userData.length === 0) {
                return res.status(404).json({ status: 404, message: "Users not found" });
            }

            for (const user of userData) {
                await createNotification(user._id);
            }

            await createNotification(admin._id);

            return res.status(200).json({ status: 200, message: "Notifications sent successfully to all users." });
        }

        if (req.body.total === "SINGLE") {
            const user = await User.findById(req.body._id);
            if (!user || user.userType !== req.body.sendTo) {
                return res.status(404).json({ status: 404, message: "User not found or invalid user type" });
            }

            const notificationData = await createNotification(user._id);

            return res.status(200).json({ status: 200, message: "Notification sent successfully.", data: notificationData });
        }

        return res.status(400).json({ status: 400, message: "Invalid 'total' value" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error", data: {} });
    }
};


exports.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: 'read' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        return res.status(200).json({ status: 200, message: 'Notification marked as read', data: notification });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error marking notification as read', error: error.message });
    }
};


exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ userId: userId }).populate('userId');

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

