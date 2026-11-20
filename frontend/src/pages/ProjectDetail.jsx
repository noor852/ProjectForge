import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { request } from "../api";

// Feature 4: one project's full page  |  Feature 10: request to join  |  Feature 11: remove / leave
function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [pendingType, setPendingType] = useState(null);
  const [meId, setMeId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadProject() {
    return request("/api/projects/" + id + "/detail")
      .then(function (data) {
        setProject(data.project);
        setIsOwner(data.isOwner);
        setIsMember(data.isMember);
        setMeId(data.meId);
        setPendingType(data.pendingType);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    setLoading(true);
    setError("");
    loadProject();
  }, [id]);

  // Feature 11: owner removes a member, or a member leaves
  function handleRemove(userId, isSelf) {
    const question = isSelf ? "Leave this team?" : "Remove this member?";
    if (!window.confirm(question)) {
      return;
    }
    setMsg("");
    request("/api/projects/" + id + "/members/" + userId, "DELETE")
      .then(loadProject)
      .catch(function (err) {
        setMsg(err.message);
      });
  }

  function handleJoin() {
    setMsg("");
    request("/api/requests", "POST", { projectId: id, type: "request" })
      .then(function () {
        setPendingType("request");
        setMsg("Request sent!");
      })
      .catch(function (err) {
        setMsg(err.message);
      });
  }

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!project) {
    return null;
  }

  const acceptingMembers = project.status === "looking" || project.status === "forming";

  return (
    <div>
      <div className="page-header">
        <h2>{project.title}</h2>
        <Link to="/discover" className="link-btn">Back</Link>
      </div>

      <div className="card">
        <p>{project.description}</p>
        <p className="muted">
          {project.domain ? project.domain + " | " : ""}
          Status: {project.status.replace("_", " ")} | Team size: {project.teamSize}
        </p>
        <p><b>Technologies:</b> {project.technologies.join(", ") || "none"}</p>
        {project.rolesNeeded && project.rolesNeeded.length > 0 && (
          <p><b>Roles needed:</b> {project.rolesNeeded.join(", ")}</p>
          
        )}

        

        <h3>Required skills</h3>
        <ul>
          {project.requiredSkills.map(function (s) {
            return <li key={s.name}>{s.name}: level {s.minLevel}+ ({s.importance})</li>;
          })}
        </ul>

        <h3>Team ({project.members.length + 1}/{project.teamSize})</h3>
        <ul>
          <li>
            <Link to={"/student/" + project.owner._id}>{project.owner.name}</Link> (owner)
          </li>
          {project.members.map(function (m) {
            const isSelf = m.user._id === meId;
            return (
              <li key={m.user._id}>
                <Link to={"/student/" + m.user._id}>{m.user.name}</Link>
                {m.role ? " (" + m.role + ")" : ""}{" "}
                {(isOwner || isSelf) && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={function () { handleRemove(m.user._id, isSelf); }}
                  >
                    {isSelf ? "Leave" : "Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {isOwner && (
          <div className="project-actions">
            <Link to={"/project/" + project._id + "/team-match"} className="link-btn">
              Team-aware suggestions
            </Link>
          </div>
        )}

        {/* Feature 10: join request */}
        {!isOwner && !isMember && !pendingType && acceptingMembers && (
          <div className="project-actions">
            <button onClick={handleJoin}>Request to join</button>
          </div>
        )}
        {!isOwner && !isMember && !acceptingMembers && (
          <p className="muted">This project is not accepting members.</p>
        )}
        {pendingType === "request" && <p className="muted">Your request is pending.</p>}
        {pendingType === "invite" && (
          <p className="success">
            You were invited! Answer it in <Link to="/requests">Requests</Link>.
          </p>
        )}
        {isMember && <p className="success">You are on this team.</p>}
        {msg && <p className="muted">{msg}</p>}
      </div>
    </div>
  );
}

export default ProjectDetail;