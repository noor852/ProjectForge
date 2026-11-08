import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { request } from "../api";

function FindTeammates() {
  const { id } = useParams();
  const [projectTitle, setProjectTitle] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitedIds, setInvitedIds] = useState([]);

  async function loadCandidates() {
    setLoading(true);
    setError("");
    try {
      const url =
        "/api/projects/" + id + "/candidates?search=" +
        encodeURIComponent(search) + "&experience=" + experience;
      const data = await request(url);
      setProjectTitle(data.project.title);
      setCandidates(data.candidates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadCandidates();
  }, [id]);

  function handleSearch(e) {
    e.preventDefault();
    loadCandidates();
  }
  async function handleInvite(candidateId) {
    const role = window.prompt("Which role is this person invited for? (e.g. frontend)");
    if (role === null) {
      return;
    }
    setError("");
    try {
      await request("/api/invitations", "POST", {
        projectId: id,
        studentId: candidateId,
        role: role
      });
      setInvitedIds([...invitedIds, candidateId]);
    } catch (err) {
      setError(err.message);
    }
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

  return (
    <div>
      <div className="page-header">
        <h2>Find Teammates{projectTitle ? ": " + projectTitle : ""}</h2>
        <Link to="/projects" className="link-btn">Back</Link>
      </div>

      <form className="card search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search name, skill, role..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
        />
        <select
          value={experience}
          onChange={function (e) { setExperience(e.target.value); }}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button>Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && candidates.length === 0 && <p className="muted">Koi candidate nahi mila.</p>}

      {candidates.map(function (c) {
        return (
          <div className="card project-card" key={c._id}>
            <div className="candidate-top">
              <h3>{c.name}</h3>
              <span className={scoreClass(c.score)}>{c.score}% match</span>
            </div>
            <p className="muted">
              {c.experience} | {c.availability} hrs/week
            </p>
            {c.bio && <p>{c.bio}</p>}
            {c.skills.length > 0 && (
              <p>
                Skills:{" "}
                {c.skills.map(function (s) {
                  return s.name + " (" + s.level + ")";
                }).join(", ")}
              </p>
            )}
            {c.missingSkills.length > 0 && (
              <p className="error">Missing: {c.missingSkills.join(", ")}</p>
            )}
            <div className="project-actions">
              <Link to={"/student/" + c._id} className="link-btn">View Profile</Link>
                            {invitedIds.indexOf(c._id) !== -1 ? (
                <span className="badge badge-pending">Invited</span>
              ) : (
                <button
                  type="button"
                  onClick={function () { handleInvite(c._id); }}
                >
                  Invite
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FindTeammates;