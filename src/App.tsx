import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Lazy load components
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const ClassList = lazy(() => import('./pages/dashboard/ClassList').then(module => ({ default: module.ClassList })));
const NewClass = lazy(() => import('./pages/dashboard/NewClass').then(module => ({ default: module.NewClass })));
const ClassDetails = lazy(() => import('./pages/dashboard/ClassDetails').then(module => ({ default: module.ClassDetails })));
const Settings = lazy(() => import('./pages/dashboard/Settings').then(module => ({ default: module.Settings })));
const AttendanceHistory = lazy(() => import('./pages/dashboard/AttendanceHistory').then(module => ({ default: module.AttendanceHistory })));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClassList />} />
            <Route path="nova-turma" element={<NewClass />} />
            <Route path="turma/:id" element={<ClassDetails />} />
            <Route path="turma/:id/historico" element={<AttendanceHistory />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;