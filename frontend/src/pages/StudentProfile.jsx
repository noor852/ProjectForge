import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudent } from "../features/profileSlice";

export default function StudentProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { viewed: u, loading, error } = useSelector((s) => s.profile);

  useEffect(() => { dispatch(fetchStudent(id)); }, [dispatch, id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!u) return null;

  return (
    <div>
      <h2>{u.name}</h2>
      <p>{u.bio}</p>
      <p>Experience: {u.experience} | Availability: {u.availability} hrs/week</p>
      <p>Roles: {u.preferredRoles.join(", ") || "none"}</p>
      <p>Technologies: {u.technologies.join(", ") || "none"}</p>
      <p>Interests: {u.interests.join(", ") || "none"}</p>
      <h3>Skills</h3>
      <ul>{u.skills.map((s) => <li key={s.name}>{s.name}: {s.level}/5</li>)}</ul>
    </div>
  );
}