import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { request } from "../api";

// one project's full page with the loading nad error stats
function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    setLoading(true);
    setError("");
    request("/api/projects/" + id + "/detail")
      .then(function (data) {
        setProject(data.project);
        setIsOwner(data.isOwner);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!project) {
    return null;
  }

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
            return (
              <li key={m.user._id}>
                <Link to={"/student/" + m.user._id}>{m.user.name}</Link>
                {m.role ? " (" + m.role + ")" : ""}
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
      </div>
    </div>
  );
}

export default ProjectDetail;