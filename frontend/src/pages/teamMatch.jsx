import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { request } from "../api";

function TeamMatch() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [coverage, setCoverage] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    request("/api/projects/" + id + "/team-candidates")
      .then(function (data) {
        setProject(data.project);
        setCoverage(data.coverage);
        setCandidates(data.candidates);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [id]);

  function scoreClass(score) {
    if (score >= 70) {
      return "score score-high";
    }
    if (score >= 40) {
      return "score score-mid";
    }
    return "score score-low";
  }

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to={"/project/" + id} className="link-btn">Back</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Team-aware suggestions: {project.title}</h2>
        <Link to={"/project/" + id} className="link-btn">Back</Link>
      </div>

      <div className="card">
        <h3>Team skill coverage ({project.teamCount}/{project.teamSize} members)</h3>
        {coverage.length === 0 && <p className="muted">This project has no required skills yet.</p>}
        {coverage.map(function (c) {
          return (
            <div key={c.name} className="coverage-row">
              <span className="coverage-name">{c.name} ({c.importance})</span>
              <div className="bar">
                <div
                  className={"bar-fill bar-" + c.status}
                  style={{ width: Math.round(c.coverage * 100) + "%" }}
                ></div>
              </div>
              <span className="muted">{c.status}</span>
            </div>
          );
        })}
      </div>

      <h3>Suggested teammates</h3>
      {candidates.length === 0 && <p className="muted">No candidates found.</p>}

      {candidates.map(function (c) {
        return (
          <div className="card project-card" key={c._id}>
            <div className="candidate-top">
              <h3>{c.name}</h3>
              <span className={scoreClass(c.score)}>{c.score}% match</span>
            </div>
            <p className="muted">
              {c.experience} | {c.availability} hrs/week | fit {c.baseScore}% | fills gaps {c.gapScore}%
            </p>
            {c.skills.length > 0 && (
              <p>
                Skills:{" "}
                {c.skills.map(function (s) { return s.name + " (" + s.level + ")"; }).join(", ")}
              </p>
            )}
            {c.fills.length > 0 && (
              <p className="success">Fills team gaps: {c.fills.join(", ")}</p>
            )}
            {c.overlap.length > 0 && (
              <p className="muted">Team already covers: {c.overlap.join(", ")}</p>
            )}
            <div className="project-actions">
              <Link to={"/student/" + c._id} className="link-btn">View Profile</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TeamMatch;