import { Link } from "react-router-dom";

function Dashboard(props) {
  return (
    <div className="card">
      <h2>Welcome, {props.user ? props.user.name : ""}</h2>
      <p className="muted">Apni profile complete karo taake teammates tumhe dhoondh sakein.</p>
      <Link to="/profile">Edit my profile</Link>
    </div>
  );
}

export default Dashboard;