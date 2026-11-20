import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { request } from "../api";

function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(function () {
    setLoading(true);
    setError("");
    Promise.all([
      request("/api/users/" + id),
      request("/api/users/" + id + "/projects")
    ])
      .then(function (results) {
        setStudent(results[0].user);
        setProjects(results[1].projects || []);
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


  const skills = student.skills || [];
  const preferredRoles = student.preferredRoles || [];
  const technologies = student.technologies || [];
  const interests = student.interests || [];

  const totalSkills = skills.length;

  const averageSkillLevel =
    totalSkills > 0
      ? (
          skills.reduce(function (total, skill) {
            return total + skill.level;
          }, 0) / totalSkills
        ).toFixed(1)
      : 0;

  const ownedProjects = projects.filter(function (project) {
    return project.owner._id === id;
  });

  const joinedProjects = projects.filter(function (project) {
    return project.owner._id !== id;
  });

  return (
    <div className="card">
      <h2>{student.name}</h2>
      <p>{student.bio}</p>
      <div className="profile-stats">
          <div className="stat-card">
            <h3>{totalSkills}</h3>
            <p>Total Skills</p>
          </div>

          <div className="stat-card">
            <h3>{averageSkillLevel}/5</h3>
            <p>Average Proficiency</p>
          </div>

          <div className="stat-card">
            <h3>{student.availability || 0}</h3>
            <p>Hours / Week</p>
          </div>
        </div>
      <p className="muted">
        Experience: {student.experience} | Availability: {student.availability} hrs/week
      </p>
      <p><b>Roles:</b> {student.preferredRoles.join(", ") || "none"}</p>
      <p><b>Technologies:</b> {student.technologies.join(", ") || "none"}</p>
      <p><b>Interests:</b> {student.interests.join(", ") || "none"}</p>

      <h3>Skills</h3>

        {skills.length === 0 ? (
          <p className="muted">No skills added yet.</p>
        ) : (
          <div className="skill-list">
            {skills.map(function (s) {
              return (
                <div className="skill-item" key={s.name}>
                  <div className="skill-info">
                    <span>{s.name}</span>
                    <span>{s.level}/5</span>
                  </div>

                  <div className="skill-bar">
                    <div
                      className="skill-progress"
                      style={{ width: (s.level / 5) * 100 + "%" }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <div className="profile-stats">
      <div className="stat-card">
        <h3>{ownedProjects.length}</h3>
        <p>Projects Owned</p>
      </div>

      <div className="stat-card">
        <h3>{joinedProjects.length}</h3>
        <p>Projects Joined</p>
      </div>
    </div>

      <h3>Projects</h3>

      {projects.length === 0 ? (
        <p className="muted">No projects yet.</p>
      ) : (
        <ul>
          {projects.map(function (project) {
            return (
              <li key={project._id}>
                <a href={"/project/" + project._id}>
                  {project.title}
                </a>
                {" "}({project.owner._id === id ? "Owner" : "Member"})
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default StudentProfile;