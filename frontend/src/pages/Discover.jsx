import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

// the chip value is searched inside the project's domain text
const DOMAINS = [
  { label: "All", value: "" },
  { label: "Web", value: "web" },
  { label: "AI / ML", value: "ai" },
  { label: "Cybersecurity", value: "cyber" },
  { label: "Mobile", value: "mobile" },
  { label: "Data", value: "data" }
];

// Feature 4: browse and filter all projects
function Discover() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [skills, setSkills] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // domainValue is passed when a chip is clicked, because the state is not updated yet
  async function loadProjects(pageNumber, domainValue) {
    setLoading(true);
    setError("");
    const domainToUse = domainValue === undefined ? domain : domainValue;
    try {
      const url =
        "/api/projects?page=" + pageNumber +
        "&search=" + encodeURIComponent(search) +
        "&domain=" + encodeURIComponent(domainToUse) +
        "&skills=" + encodeURIComponent(skills) +
        "&technologies=" + encodeURIComponent(technologies) +
        "&teamSize=" + teamSize +
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

  function handleChip(value) {
    setDomain(value);
    loadProjects(1, value);
  }

  function handleClear() {
    setSearch("");
    setDomain("");
    setSkills("");
    setTechnologies("");
    setTeamSize("");
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
      <form onSubmit={handleSearch}>
        <div className="hero">
          <h1>Find the right team for your project</h1>
          <p>Browse student projects and join the ones that fit your skills.</p>
          <div className="hero-search">
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Search by title or description"
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
            />
            <button>Search</button>
          </div>
        </div>

        <div className="chip-row">
          {DOMAINS.map(function (d) {
            return (
              <button
                type="button"
                key={d.label}
                className={domain === d.value ? "chip chip-active" : "chip"}
                onClick={function () { handleChip(d.value); }}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="filter-row">
          <input
            aria-label="Skills"
            placeholder="Skills (react, node)"
            value={skills}
            onChange={function (e) { setSkills(e.target.value); }}
          />
          <input
            aria-label="Technologies"
            placeholder="Technologies (mongodb, express)"
            value={technologies}
            onChange={function (e) { setTechnologies(e.target.value); }}
          />
          <select
            aria-label="Team size"
            value={teamSize}
            onChange={function (e) { setTeamSize(e.target.value); }}
          >
            <option value="">Any team size</option>
            <option value="2">2 members</option>
            <option value="3">3 members</option>
            <option value="4">4 members</option>
          </select>
          <select
            aria-label="Status"
            value={status}
            onChange={function (e) { setStatus(e.target.value); }}
          >
            <option value="">Any status</option>
            <option value="looking">Looking</option>
            <option value="forming">Forming</option>
            <option value="complete">Complete</option>
            <option value="in_progress">In progress</option>
          </select>
          <button type="submit">Apply filters</button>
          <button type="button" className="btn-outline" onClick={handleClear}>Clear</button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && <p className="muted">{total} project(s) found</p>}

      <div className="project-grid">
        {projects.map(function (p) {
          return (
            <div className="project-tile" key={p._id}>
              <div className="tile-top">
                <span className="pill pill-domain">{p.domain || "General"}</span>
                <span className="pill pill-status">{p.status.replace("_", " ")}</span>
              </div>
              <h3 className="tile-title">{p.title}</h3>
              <p className="tile-desc">{p.description}</p>
              <div className="tile-skills">
                {p.requiredSkills.slice(0, 4).map(function (s) {
                  return <span className="skill-tag" key={s.name}>{s.name}</span>;
                })}
              </div>
              <div className="tile-footer">
                <span>
                  {p.members.length + 1}/{p.teamSize} members
                  {p.owner ? " · by " + p.owner.name : ""}
                </span>
                <Link to={"/project/" + p._id}>View project</Link>
              </div>
            </div>
          );
        })}
      </div>

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