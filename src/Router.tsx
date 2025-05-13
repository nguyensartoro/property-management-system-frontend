import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';

import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RentersPage from './pages/RentersPage';
import ServicesPage from './pages/ServicesPage';
import ContractsPage from './pages/ContractsPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import CalendarDemo from './components/CalendarDemo';
import PlansPage from './pages/PlansPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

const Router: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuthStore();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public routes */}
      <Route path="/login" element={
        loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
      } />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="renters" element={<RentersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="calendar-demo" element={<CalendarDemo />} />
        </Route>
      </Route>
      
      {/* 404 catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Router;