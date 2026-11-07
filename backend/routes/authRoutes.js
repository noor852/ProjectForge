const router = require('express').Router();
const {register, login, me} = require("../controller/authController");
const auth = require("../middleware/auth");

router.post("/register",  register);
router.post("/login",  login);
router.get("/me", auth, me);

module.exports = router;