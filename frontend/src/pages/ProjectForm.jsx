import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request } from "../api";
import ProjectSkillRow from "../components/ProjectSkillRow";

function toList(text) {
  return text.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
}

function ProjectForm() {
  const { id } = useParams();       // with an id this is edit mode, otherwise a new project
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    domain: "",
    expectedDuration: "",
    teamSize: 4,
    status: "looking",
    technologies: "",
    roles: "",
    requiredSkills: []
  });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // in edit mode, load the old project into the form
  useEffect(function () {
    if (!id) {
      return;
    }
    request("/api/projects/" + id)
      .then(function (data) {
        const p = data.project;
        setForm({
          title: p.title || "",
          description: p.description || "",
          domain: p.domain || "",
          expectedDuration: p.expectedDuration || "",
          teamSize: p.teamSize || 4,
          status: p.status || "looking",
          technologies: (p.technologies || []).join(", "),
          roles: (p.rolesNeeded || []).join(", "),
          requiredSkills: p.requiredSkills || []
        });
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addSkill() {
    setForm({
      ...form,
      requiredSkills: [...form.requiredSkills, { name: "", importance: "essential", minLevel: 3 }]
    });
  }

  function removeSkill(index) {
    setForm({
      ...form,
      requiredSkills: form.requiredSkills.filter(function (s, i) { return i !== index; })
    });
  }

  function changeSkill(index, field, value) {
    const newSkills = form.requiredSkills.map(function (s, i) {
      if (i === index) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setForm({ ...form, requiredSkills: newSkills });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const cleanSkills = form.requiredSkills.filter(function (s) {
      return s.name.trim() !== "";
    });

    const body = {
      title: form.title,
      description: form.description,
      domain: form.domain,
      expectedDuration: form.expectedDuration,
      teamSize: Number(form.teamSize),
      status: form.status,
      technologies: toList(form.technologies),
      rolesNeeded: toList(form.roles),
      requiredSkills: cleanSkills
    };

    try {
      if (id) {
        await request("/api/projects/" + id, "PUT", body);
      } else {
        await request("/api/projects", "POST", body);
      }
      navigate("/projects");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{id ? "Edit Project" : "New Project"}</h2>

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} required />
      </label>

      <label>
        Domain
        <input name="domain" placeholder="web, ai, mobile" value={form.domain} onChange={handleChange} />
      </label>

      <label>
        Expected duration
        <input
          name="expectedDuration"
          placeholder="3 months, 1 semester"
          value={form.expectedDuration}
          onChange={handleChange}
        />
      </label>

      <label>
        Team size
        <input
          type="number"
          name="teamSize"
          min="2"
          max="4"
          value={form.teamSize}
          onChange={handleChange}
        />
      </label>

      <label>
        Status
        <select name="status" value={form.status} onChange={handleChange}>
          {(form.status === "forming" || form.status === "complete") && (
            <option value={form.status} disabled>
              {form.status === "forming" ? "Forming (automatic)" : "Complete (automatic)"}
            </option>
          )}
          <option value="draft">Draft</option>
          <option value="looking">Looking for members</option>
          <option value="in_progress">In progress</option>
          <option value="archived">Archived</option>
        </select>
        <small className="muted">
          Forming and complete change automatically when members join or leave.
        </small>
      </label>

      <label>
        Technologies (comma separated)
        <input
          name="technologies"
          placeholder="react, node, mongodb"
          value={form.technologies}
          onChange={handleChange}
        />
      </label>

      <label>
        Roles needed (comma separated)
        <input
          name="roles"
          placeholder="frontend, backend, designer"
          value={form.roles}
          onChange={handleChange}
        />
      </label>

      <h3>Required skills</h3>
      {form.requiredSkills.map(function (s, i) {
        return (
          <ProjectSkillRow
            key={i}
            skill={s}
            index={i}
            onChange={changeSkill}
            onRemove={removeSkill}
          />
        );
      })}
      <button type="button" className="btn-outline" onClick={addSkill}>+ Add skill</button>

      <button disabled={saving}>{saving ? "Saving..." : "Save project"}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default ProjectForm;