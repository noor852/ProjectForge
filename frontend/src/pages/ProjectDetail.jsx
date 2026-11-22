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

  // owner changes the role of a member
  function handleRole(userId, oldRole) {
    const role = window.prompt("Enter the new role for this member", oldRole || "");
    if (role === null || role.trim() === "") {
      return;
    }
    setMsg("");
    request("/api/projects/" + id + "/members/" + userId, "PUT", { role: role })
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

  const teamCount = project.members.length + 1;
  const requiredSkills = project.requiredSkills || [];
  const technologies = project.technologies || [];
  const rolesNeeded = project.rolesNeeded || [];
  const acceptingMembers = project.status === "looking" || project.status === "forming";

  return (
    <div>
      <div className="page-header">
        <h2>{project.title}</h2>
        <Link to="/discover" className="link-btn">Back</Link>
      </div>

      <div className="card project-detail-card">

        {/* Description */}
        <div className="project-overview">
          <div className="project-status">
            <span className={"badge badge-" + project.status}>
              {project.status.replace("_", " ")}
            </span>
            <span className="muted">{project.domain}</span>
          </div>

          <p>{project.description}</p>
          {project.expectedDuration && (
            <p className="muted">Expected duration: {project.expectedDuration}</p>
          )}
        </div>

        {/* Project Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <h3>{teamCount}/{project.teamSize}</h3>
            <p>Team Members</p>
          </div>

          <div className="stat-card">
            <h3>{requiredSkills.length}</h3>
            <p>Required Skills</p>
          </div>

          <div className="stat-card">
            <h3>{technologies.length}</h3>
            <p>Technologies</p>
          </div>
        </div>

        {/* Technologies */}
        <h3>Technologies</h3>
        <div className="tag-list">
          {technologies.length > 0 ? (
            technologies.map(function (tech) {
              return <span className="tech-tag" key={tech}>{tech}</span>;
            })
          ) : (
            <p className="muted">No technologies specified.</p>
          )}
        </div>

        {/* Roles Needed */}
        <h3>Looking For</h3>
        <div className="tag-list">
          {rolesNeeded.length > 0 ? (
            rolesNeeded.map(function (role) {
              return <span className="role-tag" key={role}>{role}</span>;
            })
          ) : (
            <p className="muted">No specific roles listed.</p>
          )}
        </div>

        {/* Required Skills */}
        <h3>Required Skills</h3>

        {requiredSkills.length === 0 ? (
          <p className="muted">No required skills specified.</p>
        ) : (
          <div className="project-skills">
            {requiredSkills.map(function (skill) {
              return (
                <div className="project-skill-card" key={skill.name}>
                  <div className="skill-info">
                    <strong>{skill.name}</strong>
                    <span>{skill.minLevel}/5</span>
                  </div>

                  <div className="skill-bar">
                    <div
                      className="skill-progress"
                      style={{ width: (skill.minLevel / 5) * 100 + "%" }}
                    ></div>
                  </div>

                  <span className={"badge badge-" + skill.importance}>
                    {skill.importance}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Team */}
        <h3>Project Team ({teamCount}/{project.teamSize})</h3>

        <div className="project-team">
          <div className="team-member">
            <div className="member-avatar">
              {project.owner.name.charAt(0).toUpperCase()}
            </div>

            <div className="member-info">
              <Link to={"/student/" + project.owner._id}>
                <strong>{project.owner.name}</strong>
              </Link>
              <span>Project Owner</span>
            </div>

            <span className="member-label">Owner</span>
          </div>

          {project.members.map(function (m) {
            const isSelf = m.user._id === meId;

            return (
              <div className="team-member" key={m.user._id}>
                <div className="member-avatar">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>

                <div className="member-info">
                  <Link to={"/student/" + m.user._id}>
                    <strong>{m.user.name}</strong>
                  </Link>
                  <span>{m.role || "Team Member"}</span>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={function () {
                      handleRole(m.user._id, m.role);
                    }}
                  >
                    Change role
                  </button>
                )}

                {(isOwner || isSelf) ? (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={function () {
                      handleRemove(m.user._id, isSelf);
                    }}
                  >
                    {isSelf ? "Leave" : "Remove"}
                  </button>
                ) : (
                  <span className="member-label">Member</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Existing Actions */}
        {isOwner && (
          <div className="project-actions">
            <Link to={"/project/" + project._id + "/team-match"} className="link-btn">
              Team-aware suggestions
            </Link>
          </div>
        )}

        {!isOwner && !isMember && !pendingType && acceptingMembers && (
          <div className="project-actions">
            <button onClick={handleJoin}>Request to join</button>
          </div>
        )}

        {!isOwner && !isMember && !acceptingMembers && (
          <p className="muted">This project is not accepting members.</p>
        )}

        {pendingType === "request" && (
          <p className="muted">Your request is pending.</p>
        )}

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