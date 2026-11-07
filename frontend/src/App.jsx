import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { fetchMe } from "./features/authSlice";
import Navbar from "./navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import StudentProfile from "./pages/StudentProfile";
import "./App.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("token")) dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;