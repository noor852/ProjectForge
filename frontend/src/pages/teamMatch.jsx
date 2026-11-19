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
  const [invited, setInvited] = useState({});
  const [inviteMsg, setInviteMsg] = useState("");

  const [summary, setSummary] = useState(null);
  const [gaps, setGaps] = useState([]);

  useEffect(function () {
    request("/api/projects/" + id + "/team-candidates")
      .then(function (data) {
        setProject(data.project);
        setCoverage(data.coverage);
        setCandidates(data.candidates);
        setSummary(data.summary);
        setGaps(data.gaps);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [id]);


  function handleInvite(studentId) {
    setInviteMsg("");
    request("/api/requests", "POST", { projectId: id, type: "invite", studentId: studentId })
      .then(function () {
        setInvited(function (prev) { return { ...prev, [studentId]: true }; });
      })
      .catch(function (err) {
        setInviteMsg(err.message);
      });
  }
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

      {inviteMsg && <p className="error">{inviteMsg}</p>}


      {summary && (
        <div className="card">
          <h3>Overall Team Skill Coverage</h3>

          <h2>{summary.overallCoverage}%</h2>

          <div className="bar">
            <div
              className="bar-fill bar-covered"
              style={{
                width: summary.overallCoverage + "%"
              }}
            ></div>
          </div>

          <div className="coverage-stats">
            <span>Covered: {summary.covered}</span>
            <span>Partial: {summary.partial}</span>
            <span>Missing: {summary.missing}</span>
            <span>Total: {summary.total}</span>
          </div>

          {summary.essentialGaps > 0 && (
            <p className="error">
              {summary.essentialGaps} essential skill gap(s) need attention.
            </p>
          )}

          {summary.essentialGaps === 0 && (
            <p className="success">
              All essential skills are covered!
            </p>
          )}
        </div>
      )}
      <div className="card">
        <h3>Team skill coverage ({project.teamCount}/{project.teamSize} members)</h3>
        {coverage.length === 0 && <p className="muted">This project has no required skills yet.</p>}
        {coverage.map(function (c) {
          return (
            <div key={c.name} className="coverage-row">
              <div className="coverage-info">
                <b>{c.name}</b>

                <span className="muted">
                  {c.importance} | Required: {c.minLevel}/5
                </span>
              </div>

              <div className="bar">
                <div
                  className={"bar-fill bar-" + c.status}
                  style={{ width: c.percentage + "%" }}
                ></div>
              </div>

              <span className="muted">
                {c.best}/5 ({c.percentage}%)
              </span>

              <span className={"badge badge-" + c.status}>
                {c.status}
              </span>

              {c.priority !== "none" && (
                <span className={"badge badge-" + c.priority}>
                  {c.priority} priority
                </span>
              )}
            </div>
          );
        })}

        <div className="card">
          <h3>Detected Skill Gaps</h3>

          {gaps.length === 0 ? (
            <p className="success">
              No skill gaps detected. Your team covers all required skills!
            </p>
          ) : (
            gaps.map(function (g) {
              return (
                <div key={g.name} className="gap-item">
                  <div>
                    <b>{g.name}</b>
                    <p className="muted">
                      {g.status === "missing"
                        ? "No team member has this skill."
                        : "Team proficiency is below the required level."}
                    </p>
                  </div>

                  <span className={
                    g.priority === "high"
                      ? "badge badge-high"
                      : "badge badge-medium"
                  }>
                    {g.priority} priority
                  </span>
                </div>
              );
            })
          )}
</div>
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
              <button disabled={invited[c._id]} onClick={function () { handleInvite(c._id); }}>
                {invited[c._id] ? "Invited" : "Invite"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TeamMatch;