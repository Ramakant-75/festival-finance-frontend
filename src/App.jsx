import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
                <ChatWidget />
              </ProtectedRoute>
            }
          />

            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Dashboard />
                  <ChatWidget />
                </ProtectedRoute>
              }
            />

          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <DonationForm />
                <ChatWidget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-donations"
            element={
              <ProtectedRoute>
                <ManageDonations />
                <ChatWidget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpenseForm />
                <ChatWidget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-expenses"
            element={
              <ProtectedRoute>
                <ManageExpenses />
                <ChatWidget />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
