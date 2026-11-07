const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  createProject,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
  getCandidates
} = require("../controller/projectController");

router.post("/", auth, createProject);
router.get("/mine", auth, getMyProjects);   // /:id se pehle
router.get("/:id", auth, getProject);
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);
router.get("/:id/candidates", auth, getCandidates);

module.exports = router;