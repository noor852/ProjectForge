import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

// Feature 10: inbox for join requests and invitations
function Requests() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadRequests() {
    request("/api/requests/mine")
      .then(function (data) {
        setReceived(data.received);
        setSent(data.sent);
      })
      .catch(function (err) {
        setError(err.message);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    loadRequests();
  }, []);

  function handleRespond(id, action) {
    setError("");
    request("/api/requests/" + id, "PUT", { action: action })
      .then(loadRequests)
      .catch(function (err) {
        setError(err.message);
      });
  }

  function handleCancel(id) {
    setError("");
    request("/api/requests/" + id, "DELETE")
      .then(loadRequests)
      .catch(function (err) {
        setError(err.message);
      });
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Requests</h2>
      </div>

      {error && <p className="error">{error}</p>}

      <h3>Waiting for your answer</h3>
      {received.length === 0 && <p className="muted">Nothing waiting.</p>}
      {received.map(function (r) 
      {
        return (
          <div className="card project-card" key={r._id}>
            {r.type === "request" ? (
              <p>
                <Link to={"/student/" + r.student._id}>{r.student.name}</Link> wants to join{" "}
                <Link to={"/project/" + r.project._id}>{r.project.title}</Link>
              </p>
            ) : (
              <p>
                {r.project.owner.name} invited you to join{" "}
                <Link to={"/project/" + r.project._id}>{r.project.title}</Link>
              </p>
              
            )}
            {r.type === "invite" && r.expiresAt && (
              <p className="muted">
                Expires: {new Date(r.expiresAt).toLocaleString()}
              </p>
            )}
            <div className="project-actions">
              <button onClick={function () { handleRespond(r._id, "accept"); }}>Accept</button>
              <button className="btn-outline" onClick={function () { handleRespond(r._id, "decline"); }}>
                Decline
              </button>
            </div>
          </div>
        );
      })}

      <h3>Sent by you</h3>
      {sent.length === 0 && <p className="muted">You haven't sent anything.</p>}
      {sent.map(function (r) 
      {
        return (
          <div className="card project-card" key={r._id}>
            {r.type === "request" ? (
              <p>
                You asked to join{" "}
                <Link to={"/project/" + r.project._id}>{r.project.title}</Link>
              </p>
            ) : (
              <p>
                You invited <Link to={"/student/" + r.student._id}>{r.student.name}</Link> to{" "}
                <Link to={"/project/" + r.project._id}>{r.project.title}</Link>
              </p>
            )}
            <p className="muted">Status: {r.status}</p>
            {r.status === "pending" && (
              <div className="project-actions">
                <button className="btn-outline" onClick={function () { handleCancel(r._id); }}>
                  Cancel
                </button>
              </div>
            )}

            {r.type === "invite" && r.expiresAt && r.status === "pending" && (
              <p className="muted">
                Expires: {new Date(r.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Requests;