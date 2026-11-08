import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

// Feature 4: browse and filter all projects
function Discover() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [skills, setSkills] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects(pageNumber) {
    setLoading(true);
    setError("");
    try {
      const url =
        "/api/projects?page=" + pageNumber +
        "&search=" + encodeURIComponent(search) +
        "&domain=" + encodeURIComponent(domain) +
        "&skills=" + encodeURIComponent(skills) +
        "&status=" + status;
      const data = await request(url);
      setProjects(data.projects);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadProjects(1);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadProjects(1);
  }

  function handleClear() {
    setSearch("");
    setDomain("");
    setSkills("");
    setStatus("");
    // state updates are async, so load with empty filters directly
    setLoading(true);
    request("/api/projects?page=1")
      .then(function (data) {
        setProjects(data.projects);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  return (
    <div>
      <div className="page-header">
        <h2>Discover Projects</h2>
      </div>

      <form className="card search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search title or description"
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
        />
        <input
          placeholder="Domain (web, ai)"
          value={domain}
          onChange={function (e) { setDomain(e.target.value); }}
        />
        <input
          placeholder="Skills (react, node)"
          value={skills}
          onChange={function (e) { setSkills(e.target.value); }}
        />
        <select value={status} onChange={function (e) { setStatus(e.target.value); }}>
          <option value="">Any status</option>
          <option value="looking">Looking</option>
          <option value="forming">Forming</option>
          <option value="complete">Complete</option>
          <option value="in_progress">In progress</option>
        </select>
        <button>Search</button>
        <button type="button" className="btn-outline" onClick={handleClear}>Clear</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && <p className="muted">{total} project(s) found</p>}

      {projects.map(function (p) {
        return (
          <div className="card project-card" key={p._id}>
            <h3>{p.title}</h3>
            <p className="muted">
              {p.domain ? p.domain + " | " : ""}
              {p.status.replace("_", " ")} | {p.members.length + 1}/{p.teamSize} members
              {p.owner ? " | by " + p.owner.name : ""}
            </p>
            <p>{p.description}</p>
            {p.requiredSkills.length > 0 && (
              <p>
                Needs:{" "}
                {p.requiredSkills.map(function (s) { return s.name; }).join(", ")}
              </p>
            )}
            <div className="project-actions">
              <Link to={"/project/" + p._id} className="link-btn">View Details</Link>
            </div>
          </div>
        );
      })}

      {pages > 1 && (
        <div className="project-actions">
          <button
            type="button"
            className="btn-outline"
            disabled={page <= 1}
            onClick={function () { loadProjects(page - 1); }}
          >
            Prev
          </button>
          <span className="muted">Page {page} of {pages}</span>
          <button
            type="button"
            className="btn-outline"
            disabled={page >= pages}
            onClick={function () { loadProjects(page + 1); }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Discover;