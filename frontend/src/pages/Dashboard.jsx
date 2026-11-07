import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";

function Dashboard()
{
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    return(
        <div>
            <h2>Welcome, {user?.name}</h2>
            <button onClick={() => dispatch(logout())}>Logout</button>
        </div>
    );
}

export default Dashboard;