import React from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Protected } from './components/Protected';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MemberPage } from './pages/MemberPage';
import { AdminPage } from './pages/AdminPage';
import { useAuth, getDashboardPath } from './context/AuthContext';

const RoleRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/member"
            element={
              <Protected roles={["member"]}>
                <MemberPage />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected roles={["admin"]}>
                <AdminPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
