import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MentorPage from './pages/MentorPage';
import CodingPage from './pages/CodingPage';
import CareerPage from './pages/CareerPage';
import ResumePage from './pages/ResumePage';
import GithubPage from './pages/GithubPage';
import RoadmapPage from './pages/RoadmapPage';
import PassportPage from './pages/PassportPage';
import ProjectsPage from './pages/ProjectsPage';
import JobsPage from './pages/JobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import CompanyPage from './pages/CompanyPage';
import SettingsPage from './pages/SettingsPage';
import FacultyDashboardPage from './pages/FacultyDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import { AuthProvider } from './context/AuthContext';
import { CareerProvider } from './context/CareerContext';
import { ModalProvider } from './context/ModalContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CareerProvider>
        <ModalProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Routes inside MainLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* Default Index Route */}
                <Route
                  index
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* Student SaaS Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="jobs"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                      <JobsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="applications"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                      <MyApplicationsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="profile"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="mentor"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MentorPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="coding"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CodingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="career"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <CareerPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="resume"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ResumePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="github"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <GithubPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="roadmap"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <RoadmapPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="passport"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <PassportPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="projects"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="companies"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                      <CompanyPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Faculty Route */}
                <Route
                  path="faculty"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Route */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </CareerProvider>
    </AuthProvider>
  );
}

export default App;
