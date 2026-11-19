import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MentorPage from './pages/MentorPage';
import CodingPage from './pages/CodingPage';
import InterviewPage from './pages/InterviewPage';
import CareerPage from './pages/CareerPage';
import ResumePage from './pages/ResumePage';
import GithubPage from './pages/GithubPage';
import RoadmapPage from './pages/RoadmapPage';
import PassportPage from './pages/PassportPage';
import ProjectsPage from './pages/ProjectsPage';
import CompanyPage from './pages/CompanyPage';
import JobPortalPage from './pages/JobPortalPage';
import SettingsPage from './pages/SettingsPage';
import FacultyDashboardPage from './pages/FacultyDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CareerProvider } from './context/CareerContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CareerProvider>
          <ModalProvider>
            <ToastProvider>
              <ErrorBoundary>
                <BrowserRouter>
              <Routes>
                {/* Public Landing & Information Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Public Authentication Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Authenticated Workspace Pages inside MainLayout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Student Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile/:userId"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/mentor"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <MentorPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/coding"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <CodingPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/interview"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <InterviewPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/career"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <CareerPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/resume"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ResumePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/github"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <GithubPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/roadmap"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <RoadmapPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/passport"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                        <PassportPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/projects"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ProjectsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/companies"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                        <CompanyPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/jobs"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <JobPortalPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Faculty Route */}
                  <Route
                    path="/faculty"
                    element={
                      <ProtectedRoute allowedRoles={['faculty']}>
                        <FacultyDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Administrator Route - Student Database */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'student', 'faculty']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch-all redirect to public landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
              </ErrorBoundary>
            </ToastProvider>
          </ModalProvider>
        </CareerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
