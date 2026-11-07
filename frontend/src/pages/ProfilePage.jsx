import { useState, useEffect } from "react";
import { request } from "../api";
import SkillRow from "../components/SkillRow";

function toList(text) {
  return text.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
}

function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    experience: "beginner",
    availability: 10,
    roles: "",
    technologies: "",
    interests: "",
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // server se profile lao aur form me daalo
  useEffect(function () {
    request("/api/users/me")
      .then(function (data) {
        const me = data.user;
        setForm({
          name: me.name || "",
          bio: me.bio || "",
          experience: me.experience || "beginner",
          availability: me.availability ?? 10,
          roles: (me.preferredRoles || []).join(", "),
          technologies: (me.technologies || []).join(", "),
          interests: (me.interests || []).join(", "),
          skills: me.skills || []
        });
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  // har simple input yahi function use karta hai (input ke name se pata chalta hai kaunsi field hai)
  function handleChange(e) {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addSkill() {
    setForm({ ...form, skills: [...form.skills, { name: "", level: 3 }] });
  }

  function removeSkill(index) {
    setForm({
      ...form,
      skills: form.skills.filter(function (s, i) { return i !== index; })
    });
  }

  function changeSkill(index, field, value) {
    const newSkills = form.skills.map(function (s, i) {
      if (i === index) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setForm({ ...form, skills: newSkills });
  }

    async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    // khali naam wali skill rows save na hon
    const cleanSkills = form.skills.filter(function (s) {
      return s.name.trim() !== "";
    });

    try {
      await request("/api/users/me", "PUT", {
        name: form.name,
        bio: form.bio,
        experience: form.experience,
        availability: Number(form.availability),
        preferredRoles: toList(form.roles),
        technologies: toList(form.technologies),
        interests: toList(form.interests),
        skills: cleanSkills
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>My Profile</h2>

      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} />
      </label>

      <label>
        Bio
        <textarea name="bio" maxLength={300} value={form.bio} onChange={handleChange} />
      </label>

      <label>
        Experience
        <select name="experience" value={form.experience} onChange={handleChange}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>

      <label>
        Availability (hrs/week)
        <input
          type="number"
          name="availability"
          min="0"
          max="40"
          value={form.availability}
          onChange={handleChange}
        />
      </label>

      <label>
        Preferred roles (comma separated)
        <input
          name="roles"
          placeholder="frontend, backend"
          value={form.roles}
          onChange={handleChange}
        />
      </label>

      <label>
        Technologies
        <input
          name="technologies"
          placeholder="react, node, mongodb"
          value={form.technologies}
          onChange={handleChange}
        />
      </label>

      <label>
        Interests
        <input
          name="interests"
          placeholder="ai, web, security"
          value={form.interests}
          onChange={handleChange}
        />
      </label>

      <h3>Skills</h3>
      {form.skills.map(function (s, i) {
        return (
          <SkillRow
            key={i}
            skill={s}
            index={i}
            onChange={changeSkill}
            onRemove={removeSkill}
          />
        );
      })}
      <button type="button" className="btn-outline" onClick={addSkill}>+ Add skill</button>

      <button disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      {saved && <p className="success">Profile saved</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default ProfilePage;