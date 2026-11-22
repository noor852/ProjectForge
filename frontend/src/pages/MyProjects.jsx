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
    if (!window.confirm("Do you want to delete this project?")) {
      return;
    }
    try {
      await request("/api/projects/" + id, "DELETE");
      setProjects(projects.filter(function (p) { return p._id !== id; }));
    } catch (err) {
      setError(err.message);
    }
  }

  // close (archive) a project, or open it again
  async function toggleArchive(p) {
    let newStatus = "archived";
    if (p.status === "archived") {
      newStatus = "looking";
    }
    const body = {
      title: p.title,
      description: p.description,
      domain: p.domain,
      expectedDuration: p.expectedDuration,
      teamSize: p.teamSize,
      technologies: p.technologies,
      rolesNeeded: p.rolesNeeded,
      requiredSkills: p.requiredSkills,
      status: newStatus
    };
    try {
      const data = await request("/api/projects/" + p._id, "PUT", body);
      setProjects(projects.map(function (x) {
        if (x._id === p._id) {
          return data.project;
        }
        return x;
      }));
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
      {projects.length === 0 && <p className="muted">You have no projects yet.</p>}

      {projects.map(function (p) {
        return (
          <div className="card project-card" key={p._id}>
            <h3>{p.title}</h3>
            <p className="muted">
              Status: {p.status} | Team size: {p.teamSize}
              {p.domain ? " | " + p.domain : ""}
            </p>
            <p>{p.description}</p>
            {p.expectedDuration && <p>Expected duration: {p.expectedDuration}</p>}
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

              <Link
                to={"/project/" + p._id}
                className="link-btn"
              >
                Project Details
              </Link>

              <Link
                to={"/project/" + p._id + "/team-match"}
                className="link-btn"
              >
                Team-aware Suggestions
              </Link>

              <Link
                to={"/projects/" + p._id + "/find"}
                className="link-btn"
              >
                Find Teammates
              </Link>

              <Link
                to={"/projects/" + p._id + "/edit"}
                className="link-btn"
              >
                Edit
              </Link>

              <button
                type="button"
                className="btn-outline"
                onClick={function () {
                  toggleArchive(p);
                }}
              >
                {p.status === "archived" ? "Unarchive" : "Archive"}
              </button>

              {p.status !== "draft" && p.status !== "archived" && (
                <a
                  href={"/api/projects/" + p._id + "/share"}
                  target="_blank"
                  rel="noreferrer"
                  className="link-btn"
                >
                  Share
                </a>
              )}

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