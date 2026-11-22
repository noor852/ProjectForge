const router = require("express").Router();
const auth = require("../middleware/auth");
const { getMyNotifications, markRead, markAllRead } = require("../controller/notificationController");

router.get("/", auth, getMyNotifications);
router.put("/read-all", auth, markAllRead);   // must be above "/:id"
router.put("/:id", auth, markRead);

module.exports = router;