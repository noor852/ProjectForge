import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { request } from "./api";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import StudentProfile from "./pages/StudentProfile";
import MyProjects from "./pages/MyProjects";
import ProjectForm from "./pages/ProjectForm";
import FindTeammates from "./pages/FindTeammates";
import Discover from "./pages/Discover";
import ProjectDetail from "./pages/ProjectDetail";
import TeamMatch from "./pages/TeamMatch";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!localStorage.getItem("token"));

  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  // page refresh pe token se user wapas lao
  useEffect(function () {
    if (!token) {
      setChecking(false);
      return;
    }
    request("/api/auth/me")
      .then(function (data) {
        setUser(data.user);
      })
      .catch(function () {
        handleLogout();
      })
      .finally(function () {
        setChecking(false);
      });
  }, []);

  return (
    <div>
      <Navbar token={token} user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:id"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/projects"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/projects/:id/find"
            element={
              <ProtectedRoute token={token} checking={checking}>
                <FindTeammates />
              </ProtectedRoute>
            }
          />
          <Route path="/discover" element={<ProtectedRoute token={token} checking={checking}><Discover /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute token={token} checking={checking}><ProjectDetail /></ProtectedRoute>} />
          <Route path="/project/:id/team-match" element={<ProtectedRoute token={token} checking={checking}><TeamMatch /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;