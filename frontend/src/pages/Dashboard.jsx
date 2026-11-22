import { Link } from "react-router-dom";

function Dashboard(props) {
  return (
    <div className="card">
      <h2>Welcome, {props.user ? props.user.name : ""}</h2>
      <p className="muted">Complete your profile so that other students can find you as a teammate.</p>
      <Link to="/profile">Edit my profile</Link>
    </div>
  );
}

export default Dashboard;