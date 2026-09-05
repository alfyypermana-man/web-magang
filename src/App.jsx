import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { PageLoading } from "./components/Loading";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import CompanyLayout from "./layouts/CompanyLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public pages
const Landing = lazy(() => import("./pages/public/Landing"));
const Jobs = lazy(() => import("./pages/public/Jobs"));
const JobDetail = lazy(() => import("./pages/public/JobDetail"));
const Companies = lazy(() => import("./pages/public/Companies"));
const CompanyDetail = lazy(() => import("./pages/public/CompanyDetail"));
const PortfolioPublic = lazy(() => import("./pages/public/PortfolioPublic"));
const Login = lazy(() => import("./pages/public/Login"));
const RegisterChoice = lazy(() => import("./pages/public/RegisterChoice"));
const RegisterStudent = lazy(() => import("./pages/public/RegisterStudent"));
const RegisterCompany = lazy(() => import("./pages/public/RegisterCompany"));
const ForgotPassword = lazy(() => import("./pages/public/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/public/ResetPassword"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const Unauthorized = lazy(() => import("./pages/public/Unauthorized"));

// Student pages
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentJobs = lazy(() => import("./pages/student/BrowseJobs"));
const StudentApplications = lazy(() => import("./pages/student/Applications"));
const StudentSavedJobs = lazy(() => import("./pages/student/SavedJobs"));
const StudentInterviews = lazy(() => import("./pages/student/Interviews"));
const StudentMessages = lazy(() => import("./pages/student/Messages"));
const StudentNotifications = lazy(() => import("./pages/student/Notifications"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const StudentPortfolio = lazy(() => import("./pages/student/Portfolio"));
const StudentCV = lazy(() => import("./pages/student/CV"));
const StudentSettings = lazy(() => import("./pages/student/Settings"));

// Company pages
const CompanyDashboard = lazy(() => import("./pages/company/Dashboard"));
const CompanyJobs = lazy(() => import("./pages/company/Jobs"));
const CompanyCreateJob = lazy(() => import("./pages/company/CreateJob"));
const CompanyJobApplicants = lazy(() => import("./pages/company/JobApplicants"));
const CompanyApplicants = lazy(() => import("./pages/company/Applicants"));
const CompanyInterviews = lazy(() => import("./pages/company/Interviews"));
const CompanyMessages = lazy(() => import("./pages/company/Messages"));
const CompanyNotifications = lazy(() => import("./pages/company/Notifications"));
const CompanyProfile = lazy(() => import("./pages/company/Profile"));
const CompanySettings = lazy(() => import("./pages/company/Settings"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminStudents = lazy(() => import("./pages/admin/Students"));
const AdminCompanies = lazy(() => import("./pages/admin/Companies"));
const AdminJobs = lazy(() => import("./pages/admin/Jobs"));
const AdminApplications = lazy(() => import("./pages/admin/Applications"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

export default function App() {
  return (
    <Suspense fallback={<PageLoading label="Memuat halaman..." />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/portfolio/:username" element={<PortfolioPublic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/student" element={<RegisterStudent />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="saved-jobs" element={<StudentSavedJobs />} />
          <Route path="interviews" element={<StudentInterviews />} />
          <Route path="messages" element={<StudentMessages />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="portfolio" element={<StudentPortfolio />} />
          <Route path="cv" element={<StudentCV />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Company */}
        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="jobs" element={<CompanyJobs />} />
          <Route path="jobs/create" element={<CompanyCreateJob />} />
          <Route path="jobs/:id/edit" element={<CompanyCreateJob />} />
          <Route path="jobs/:id" element={<CompanyJobApplicants />} />
          <Route path="applicants" element={<CompanyApplicants />} />
          <Route path="interviews" element={<CompanyInterviews />} />
          <Route path="messages" element={<CompanyMessages />} />
          <Route path="notifications" element={<CompanyNotifications />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="activity-logs" element={<AdminActivityLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
