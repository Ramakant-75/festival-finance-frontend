// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import DonationForm from './pages/DonationForm';
import ManageDonations from './pages/ManageDonations';
import ExpenseForm from './pages/ExpenseForm';
import ManageExpenses from './pages/ManageExpenses';
import ChatWidget from './components/ChatWidget';
import AuditLogPage from './pages/AuditLogPage';
import WelcomePage from './pages/WelcomePage';
import PageTransition from './components/PageTransition';
import StatsPage from './pages/StatsPage';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><WelcomePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <PageTransition>
                <HomePage />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DonationForm />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-donations"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ManageDonations />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ExpenseForm />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-expenses"
          element={
            <ProtectedRoute>
              <PageTransition>
                <ManageExpenses />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

<Route
          path="/milestones"
          element={
            <ProtectedRoute>
              <PageTransition>
                <StatsPage />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition>
                <AuditLogPage />
                <ChatWidget />
              </PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
