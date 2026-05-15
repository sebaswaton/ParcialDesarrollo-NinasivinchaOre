import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { HomePage } from './pages/HomePage';
import { NewIncidentPage } from './pages/NewIncidentPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { MyIncidentsPage } from './pages/MyIncidentsPage';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route
              path="/incidents/new"
              element={
                <ProtectedRoute role="ciudadano">
                  <NewIncidentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-incidents"
              element={
                <ProtectedRoute role="ciudadano">
                  <MyIncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator"
              element={
                <ProtectedRoute role="operador">
                  <OperatorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
