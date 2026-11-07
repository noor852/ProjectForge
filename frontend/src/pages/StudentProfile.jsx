import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { request } from "../api";

function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    setLoading(true);
    setError("");
    request("/api/users/" + id)
      .then(function (data) {
        setStudent(data.user);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!student) {
    return null;
  }

  return (
    <div className="card">
      <h2>{student.name}</h2>
      <p>{student.bio}</p>
      <p className="muted">
        Experience: {student.experience} | Availability: {student.availability} hrs/week
      </p>
      <p><b>Roles:</b> {student.preferredRoles.join(", ") || "none"}</p>
      <p><b>Technologies:</b> {student.technologies.join(", ") || "none"}</p>
      <p><b>Interests:</b> {student.interests.join(", ") || "none"}</p>

      <h3>Skills</h3>
      <ul>
        {student.skills.map(function (s) {
          return <li key={s.name}>{s.name}: {s.level}/5</li>;
        })}
      </ul>
    </div>
  );
}

export default StudentProfile;