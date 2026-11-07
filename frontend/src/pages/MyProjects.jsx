import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    request("/api/projects/mine")
      .then(function (data) {
        setProjects(data.projects);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Is project ko delete kar dein?")) {
      return;
    }
    try {
      await request("/api/projects/" + id, "DELETE");
      setProjects(projects.filter(function (p) { return p._id !== id; }));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Projects</h2>
        <Link to="/projects/new" className="link-btn">+ New Project</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {projects.length === 0 && <p className="muted">Abhi koi project nahi hai.</p>}

      {projects.map(function (p) {
        return (
          <div className="card project-card" key={p._id}>
            <h3>{p.title}</h3>
            <p className="muted">
              Status: {p.status} | Team size: {p.teamSize}
              {p.domain ? " | " + p.domain : ""}
            </p>
            <p>{p.description}</p>
            {p.technologies.length > 0 && <p>Technologies: {p.technologies.join(", ")}</p>}
            {p.rolesNeeded && p.rolesNeeded.length > 0 && <p>Roles needed: {p.rolesNeeded.join(", ")}</p>}
            {p.requiredSkills.length > 0 && (
              <p>
                Skills:{" "}
                {p.requiredSkills.map(function (s) {
                  return s.name + " (" + s.importance + ", min " + s.minLevel + ")";
                }).join(", ")}
              </p>
            )}
            <div className="project-actions">
              <Link to={"/projects/" + p._id + "/find"} className="link-btn">Find Teammates</Link>
              <Link to={"/projects/" + p._id + "/edit"} className="link-btn">Edit</Link>
              <button
                type="button"
                className="btn-danger"
                onClick={function () {
                  handleDelete(p._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyProjects;