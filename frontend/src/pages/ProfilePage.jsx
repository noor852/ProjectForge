import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile, saveProfile, clearSaved } from "../features/profileSlice";

const toList = (str) => str.split(",").map((x) => x.trim()).filter(Boolean);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { me, loading, saving, error, saved } = useSelector((s) => s.profile);

  const [form, setForm] = useState({
    name: "", bio: "", experience: "beginner", availability: 10,
    roles: "", technologies: "", interests: "", skills: [],
  });

  useEffect(() => { dispatch(fetchMyProfile()); }, [dispatch]);

  // copy server data into the form once it arrives
  useEffect(() => {
    if (!me) return;
    setForm({
      name: me.name || "",
      bio: me.bio || "",
      experience: me.experience || "beginner",
      availability: me.availability ?? 10,
      roles: (me.preferredRoles || []).join(", "),
      technologies: (me.technologies || []).join(", "),
      interests: (me.interests || []).join(", "),
      skills: me.skills || [],
    });
  }, [me]);

  const set = (k) => (e) => { dispatch(clearSaved()); setForm({ ...form, [k]: e.target.value }); };

  const addSkill = () => setForm({ ...form, skills: [...form.skills, { name: "", level: 3 }] });
  const removeSkill = (i) => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) });
  const updateSkill = (i, field, value) =>
    setForm({ ...form, skills: form.skills.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(saveProfile({
      name: form.name,
      bio: form.bio,
      experience: form.experience,
      availability: form.availability,
      preferredRoles: toList(form.roles),
      technologies: toList(form.technologies),
      interests: toList(form.interests),
      skills: form.skills,
    }));
  };

  if (loading && !me) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>My Profile</h2>

      <label>Name <input value={form.name} onChange={set("name")} /></label>
      <label>Bio <textarea maxLength={300} value={form.bio} onChange={set("bio")} /></label>

      <label>Experience
        <select value={form.experience} onChange={set("experience")}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>

      <label>Availability (hrs/week)
        <input type="number" min="0" max="40" value={form.availability} onChange={set("availability")} />
      </label>

      <label>Preferred roles (comma separated)
        <input placeholder="frontend, backend" value={form.roles} onChange={set("roles")} />
      </label>
      <label>Technologies
        <input placeholder="react, node, mongodb" value={form.technologies} onChange={set("technologies")} />
      </label>
      <label>Interests
        <input placeholder="ai, web, security" value={form.interests} onChange={set("interests")} />
      </label>

      <h3>Skills</h3>
      {form.skills.map((s, i) => (
        <div key={i}>
          <input placeholder="skill (e.g. react)" value={s.name}
            onChange={(e) => updateSkill(i, "name", e.target.value)} />
          <select value={s.level} onChange={(e) => updateSkill(i, "level", Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button type="button" onClick={() => removeSkill(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addSkill}>+ Add skill</button>

      <br />
      <button disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      {saved && <p style={{ color: "limegreen" }}>Profile saved</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}