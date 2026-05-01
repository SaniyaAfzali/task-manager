import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Sidebar from "./components/Sidebar";

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [authPage, setAuthPage] = useState("login");

  if (!user) {
    return authPage === "login" ? (
      <Login onSwitch={() => setAuthPage("signup")} />
    ) : (
      <Signup onSwitch={() => setAuthPage("login")} />
    );
  }

  const navigate = (p, data = null) => {
    setPage(p);
    if (data) setSelectedProject(data);
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={page} navigate={navigate} />
      <main className="main-content">
        {page === "dashboard" && <Dashboard navigate={navigate} />}
        {page === "projects" && <Projects navigate={navigate} />}
        {page === "project-detail" && (
          <ProjectDetail project={selectedProject} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}