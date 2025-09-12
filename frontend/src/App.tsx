import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './routes/ProtectedRoute';
// Admin-Side Pages
import SignupWithInvite from './pages/admin/SignupWithInvite';
import Login from './pages/admin/Login';
import AdminInvitations from './pages/admin/AdminInvitations';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import AdminProfile from './pages/admin/AdminProfile';
import Messages from './pages/admin/Messages';
import EditProjects from './pages/admin/EditProjects';
import EditTestimonials from './pages/admin/EditTestimonials';
import EditServices from './pages/admin/EditServices';
import Settings from './pages/admin/Settings';
import EditExperience from './pages/admin/EditExperience';
import EditEducation from './pages/admin/EditEducation';
import EditSkills from './pages/admin/EditSkills';
import AdminUsers from './pages/admin/AdminUsers';
import EditAbout from './pages/admin/EditAbout';

// Admin-Side Pages
import Home from './pages/client/Home';

import NotFound from './pages/NotFound';

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          {/* Loading Route */}
          {/* <Route path="/loading" element={<Loading />} /> */}
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          {/* Download links are handled by server-side /download/:filename proxy */}

          {/* Invitation Signup Route */}
          <Route path="/admin/signup" element={<SignupWithInvite />} />
          {/* Admin Login Route */}
          <Route path="/admin/login" element={<Login />} />
          {/* Admin Dashboard Route (protected) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/invitations"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminInvitations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditProjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/about"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditAbout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/testimonials"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditTestimonials />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditServices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/experience"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditExperience />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/education"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditEducation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/skills"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EditSkills />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
      </div>
    </AuthProvider> 
  </Router>
);
export default App;
