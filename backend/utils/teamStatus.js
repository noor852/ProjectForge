
// ensures that the project status is with the team so that it can be used for people joining anf leaving. draft and inprogress are chosen by project owner
function updateStatus(project) {
   if (project.status === "draft" || project.status === "in_progress" || project.status === "archived") {
    return;
  }
 
  const teamCount = project.members.length + 1;   // + 1 because the owner is part of the team
 
  if (teamCount >= project.teamSize) {
    project.status = "complete";
  } else if (project.members.length > 0) {
    project.status = "forming";
  } else {
    project.status = "looking";
  }
}
 
module.exports = updateStatus;
 