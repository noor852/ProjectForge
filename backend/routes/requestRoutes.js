const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  sendRequest,
  getMyRequests,
  respondToRequest,
  cancelRequest
} = require("../controller/requestController");

router.post("/", auth, sendRequest);
router.get("/mine", auth, getMyRequests);      // must be above "/:id"
router.put("/:id", auth, respondToRequest);
router.delete("/:id", auth, cancelRequest);

module.exports = router;