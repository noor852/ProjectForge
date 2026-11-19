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

const { getProjects, getProjectDetail, getTeamCandidates } = require("../controller/discoveryController");
const { removeMember, updateRole } = require("../controller/teamController");

router.get("/", auth, getProjects);   
router.delete("/:id/members/:userId", auth, removeMember);
router.get("/:id/detail", auth, getProjectDetail);  
router.get("/:id/team-candidates", auth, getTeamCandidates); 
router.post("/", auth, createProject);
router.get("/mine", auth, getMyProjects);   // /:id se pehle
router.get("/:id", auth, getProject);
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);
router.get("/:id/candidates", auth, getCandidates);

router.put("/:id/members/:userId", auth, updateRole);

module.exports = router;