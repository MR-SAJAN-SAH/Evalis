import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import UserLoginPage from './pages/UserLoginPage'
import SuperAdminLoginPage from './pages/SuperAdminLoginPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import AdminDashboard from './admin/AdminDashboard'
import DashboardHome from './admin/pages/DashboardHome'
import UserManagement from './admin/pages/UserManagement'
import AddUser from './admin/pages/AddUser'
import AllExams from './admin/pages/AllExams'
import CreateExamPage from './admin/pages/CreateExamPage'
import PendingEvaluations from './admin/pages/PendingEvaluations'
import ResultsAnalytics from './admin/pages/ResultsAnalytics'
import LiveMonitoring from './admin/pages/LiveMonitoring'
import PerformanceReports from './admin/pages/PerformanceReports'
import AuditLogs from './admin/pages/AuditLogs'
import SystemSettings from './admin/pages/SystemSettings'
import EvaluatorDashboard from './evaluator/pages/EvaluatorDashboardV2'
import TeacherDashboard from './evaluator/pages/TeacherDashboard'
import ExamControllerDashboard from './pages/ExamControllerDashboard'
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import ExamTaking from './pages/candidate/ExamTaking'
import AdvancedClassroom from './pages/candidate/AdvancedClassroom'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user-login" element={<UserLoginPage />} />
      <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
      
      {/* User Dashboards */}
      <Route path="/evaluator/dashboard" element={<EvaluatorDashboard />} />
      <Route path="/evaluator/dashboard/evaluations" element={<EvaluatorDashboard />} />
      <Route path="/evaluator/dashboard/classroom" element={<EvaluatorDashboard />} />
      <Route path="/evaluator/dashboard/analytics" element={<EvaluatorDashboard />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/exam-controller/dashboard" element={<ExamControllerDashboard />} />
      <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate/dashboard/exams" element={<CandidateDashboard />} />
      <Route path="/candidate/dashboard/schedule" element={<CandidateDashboard />} />
      <Route path="/candidate/dashboard/results" element={<CandidateDashboard />} />
      <Route path="/candidate/dashboard/classroom" element={<CandidateDashboard />} />
      <Route path="/candidate/dashboard/history" element={<CandidateDashboard />} />
      <Route path="/candidate/dashboard/settings" element={<CandidateDashboard />} />
      <Route path="/exam/:examId" element={<ProtectedRoute requiredRole="candidate"><ExamTaking /></ProtectedRoute>} />
      
      {/* Candidate Classroom Routes with Section-specific paths */}
      <Route path="/candidate/classroom/:classroomId" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/stream" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/materials" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/classwork" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/exams" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/grades" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/analytics" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/people" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/candidate/classroom/:classroomId/settings" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      
      {/* Evaluator Classroom Routes with Section-specific paths */}
      <Route path="/evaluator/classroom/:classroomId" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/stream" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/materials" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/classwork" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/exams" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/analytics" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/people" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      <Route path="/evaluator/classroom/:classroomId/settings" element={<ProtectedRoute><AdvancedClassroom /></ProtectedRoute>} />
      {/* Admin Dashboard Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/add" element={<AddUser />} />
        <Route path="exams" element={<AllExams />} />
        <Route path="exams/create" element={<CreateExamPage />} />
        <Route path="evaluation/pending" element={<PendingEvaluations />} />
        <Route path="analytics/results" element={<ResultsAnalytics />} />
        <Route path="proctoring/live" element={<LiveMonitoring />} />
        <Route path="proctoring/reports" element={<PerformanceReports />} />
        <Route path="audit/logs" element={<AuditLogs />} />
        <Route path="settings/general" element={<SystemSettings />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Redirect /admin to /admin/dashboard */}
      {/* (Removed duplicate route) */}

      {/* SuperAdmin Dashboard Route */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
