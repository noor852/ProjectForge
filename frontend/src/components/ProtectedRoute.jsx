import { Navigate } from "react-router-dom";

function ProtectedRoute(props) {
  if (props.checking) {
    return <p>Loading...</p>;
  }
  if (!props.token) {
    return <Navigate to="/login" replace />;
  }
  return props.children;
}

export default ProtectedRoute;