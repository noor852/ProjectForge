import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}) 
{
    const {token, initializing} = useSelector((s) => s.auth);
    if (initializing)
    {
        return <p>Loading...</p>;
    }
    return token?children: <Navigate to="/login" replace/>;
}