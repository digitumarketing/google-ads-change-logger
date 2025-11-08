import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import LogPage from './pages/LogPage';
import SetupPage from './pages/SetupPage';
import { useAppContext } from './contexts/AppContext';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser } = useAppContext();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


const AppLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
           <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  </div>
);

const App: React.FC = () => {
  const { loading, users } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<Navigate to="/login" replace />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;