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
              </ProtectedRoute>
            }
          />

            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <DonationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-donations"
            element={
              <ProtectedRoute>
                <ManageDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpenseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-expenses"
            element={
              <ProtectedRoute>
                <ManageExpenses />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
