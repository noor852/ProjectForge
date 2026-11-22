import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

function scoreClass(score) {
  if (score >= 70) {
    return "score score-high";
  }
  if (score >= 40) {
    return "score score-mid";
  }
  return "score score-low";
}

// Feature 5: projects recommended to the student from his / her own profile
function Dashboard(props) {
  const [projects, setProjects] = useState([]);
  const [profileEmpty, setProfileEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    request("/api/projects/recommended")
      .then(function (data) {
        setProjects(data.projects || []);
        setProfileEmpty(data.profileEmpty);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="card">
        <h2>Welcome, {props.user ? props.user.name : ""}</h2>
        <p className="muted">Complete your profile so that other students can find you as a teammate.</p>
        <Link to="/profile">Edit my profile</Link>
      </div>

      <div className="page-header">
        <h2>Recommended projects for you</h2>
        <Link to="/discover" className="link-btn">Browse all</Link>
      </div>

      {profileEmpty && (
        <p className="muted">
          Add your skills in <Link to="/profile">your profile</Link> to get better recommendations.
        </p>
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="muted">No open projects to recommend right now.</p>
      )}

      {projects.map(function (p) {
        return (
          <div className="card project-card" key={p._id}>
            <div className="candidate-top">
              <h3>{p.title}</h3>
              <span className={scoreClass(p.score)}>{p.score}% match</span>
            </div>

            <p className="muted">
              {p.domain || "General"} | {p.status} | {p.teamCount}/{p.teamSize} members
              {" "}({p.openSpots} open) | by {p.owner}
            </p>

            {p.requiredSkills.length > 0 && (
              <div className="tag-list">
                {p.requiredSkills.map(function (s) {
                  return <span className="tech-tag" key={s.name}>{s.name}</span>;
                })}
              </div>
            )}

            <h4>Why this project</h4>
            <ul className="impact-notes">
              {p.reasons.map(function (r, i) {
                return (
                  <li key={i} className={r.kind === "good" ? "success" : "error"}>
                    {r.text}
                  </li>
                );
              })}
            </ul>

            <div className="project-actions">
              <Link to={"/project/" + p._id} className="link-btn">View project</Link>
              {p.pending && <span className="badge badge-pending">Request pending</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;