const Notification = require("../models/Notification");

// GET /api/notifications  ->  latest 20 + how many are still unread (the red number on the bell)
async function getMyNotifications(req, res) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ notifications: notifications, unread: unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/notifications/:id  ->  mark one notification as read (only my own)
async function markRead(req, res) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// PUT /api/notifications/read-all  ->  mark all of my notifications as read
async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getMyNotifications, markRead, markAllRead };