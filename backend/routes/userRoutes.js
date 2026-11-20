const router = require("express").Router();
const auth = require("../middleware/auth");
const {getMe, getUser, updateMe, getStudentProjects} = require("../controller/userController");

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.get("/:id/projects", auth, getStudentProjects);
router.get("/:id", auth, getUser);

module.exports = router;