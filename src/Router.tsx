import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import DashboardPage from './components/dashboard/DashboardPage';
import RoomsPage from './components/rooms/RoomsPage';
import RentersPage from './components/renters/RentersPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import ServicesPage from './components/services/ServicesPage';
import MessagesPage from './components/messages/MessagesPage';
import SettingsPage from './components/settings/SettingsPage';
import ContractsPage from './components/contracts/ContractsPage';
import CalendarDemo from './components/CalendarDemo';
import PageTransition from './components/shared/PageTransition';
import PlansPage from './components/plans/PlansPage';

const Router = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <PageTransition>
              <DashboardPage />
            </PageTransition>
          } />
          <Route path="rooms" element={
            <PageTransition>
              <RoomsPage />
            </PageTransition>
          } />
          <Route path="renters" element={
            <PageTransition>
              <RentersPage />
            </PageTransition>
          } />
          <Route path="analytics" element={
            <PageTransition>
              <AnalyticsPage />
            </PageTransition>
          } />
          <Route path="services" element={
            <PageTransition>
              <ServicesPage />
            </PageTransition>
          } />
          <Route path="messages" element={
            <PageTransition>
              <MessagesPage />
            </PageTransition>
          } />
          <Route path="settings" element={
            <PageTransition>
              <SettingsPage />
            </PageTransition>
          } />
          <Route path="contracts" element={
            <PageTransition>
              <ContractsPage />
            </PageTransition>
          } />
          <Route path="plans" element={
            <PageTransition>
              <PlansPage />
            </PageTransition>
          } />
          <Route path="calendar-demo" element={
            <PageTransition>
              <CalendarDemo />
            </PageTransition>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default Router; 