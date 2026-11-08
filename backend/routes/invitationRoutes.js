const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  sendInvitation,
  getReceived,
  getSent,
  respondToInvitation,
  cancelInvitation
} = require("../controller/invitationController");

router.post("/", auth, sendInvitation);
router.get("/received", auth, getReceived);
router.get("/sent", auth, getSent);
router.put("/:id", auth, respondToInvitation);
router.delete("/:id", auth, cancelInvitation);

module.exports = router;