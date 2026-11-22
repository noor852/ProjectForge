const Notification = require("../models/Notification");

// create a notification, a problem here must never break the real request, so errors are only printed
async function notify(userId, type, message, projectId, requestId) {
  try {
    await Notification.create({
      user: userId,
      type: type,
      message: message,
      project: projectId,
      request: requestId
    });
  } catch (err) {
    console.error("Notification failed: " + err.message);
  }
}

// the request was answered (accepted / declined), so its old notification is read now
async function markRequestRead(requestId) {
  try {
    await Notification.updateMany({ request: requestId }, { read: true });
  } catch (err) {
    console.error("Notification failed: " + err.message);
  }
}

// the request was cancelled by the sender, so its notification is removed
async function removeRequestNotifications(requestId) {
  try {
    await Notification.deleteMany({ request: requestId });
  } catch (err) {
    console.error("Notification failed: " + err.message);
  }
}

module.exports = { notify, markRequestRead, removeRequestNotifications };