import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { request } from "../api";

function Invitations() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const r = await request("/api/invitations/received");
      const s = await request("/api/invitations/sent");
      setReceived(r.invitations);
      setSent(s.invitations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadAll();
  }, []);

  async function handleRespond(id, status) {
    setError("");
    try {
      await request("/api/invitations/" + id, "PUT", { status: status });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    setError("");
    try {
      await request("/api/invitations/" + id, "DELETE");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Invitations</h2>
      {error && <p className="error">{error}</p>}

      <h3>Received</h3>
      {received.length === 0 && <p className="muted">No invitations received.</p>}
      {received.map(function (inv) {
        return (
          <div className="card project-card" key={inv._id}>
            <div className="candidate-top">
              <h3>{inv.project ? inv.project.title : "Deleted project"}</h3>
              <span className={"badge badge-" + inv.status}>{inv.status}</span>
            </div>
            <p className="muted">
              From {inv.owner ? inv.owner.name : "unknown"}
              {inv.role ? " | Role: " + inv.role : ""}
            </p>
            {inv.message && <p>{inv.message}</p>}
            {inv.status === "pending" && (
              <div className="project-actions">
                <button
                  type="button"
                  onClick={function () { handleRespond(inv._id, "accepted"); }}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={function () { handleRespond(inv._id, "declined"); }}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        );
      })}

      <h3>Sent</h3>
      {sent.length === 0 && <p className="muted">You have not sent any invitations.</p>}
      {sent.map(function (inv) {
        return (
          <div className="card project-card" key={inv._id}>
            <div className="candidate-top">
              <h3>{inv.project ? inv.project.title : "Deleted project"}</h3>
              <span className={"badge badge-" + inv.status}>{inv.status}</span>
            </div>
            <p className="muted">
              To{" "}
              {inv.student ? (
                <Link to={"/student/" + inv.student._id}>{inv.student.name}</Link>
              ) : (
                "unknown"
              )}
              {inv.role ? " | Role: " + inv.role : ""}
            </p>
            {inv.status === "pending" && (
              <div className="project-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={function () { handleCancel(inv._id); }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Invitations;