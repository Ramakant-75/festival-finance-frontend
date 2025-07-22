import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DonationForm from './pages/DonationForm';
import HomePage from './pages/HomePage';
import ManageDonations from './pages/ManageDonations';
import ExpenseForm from './pages/ExpenseForm';
import ManageExpenses from './pages/ManageExpenses';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/donate" element={<DonationForm />} />
        <Route path="/report" element={<Dashboard />} />
        <Route path="/manage-donations" element={<ManageDonations />} />
        <Route path="/expenses" element={<ExpenseForm />} />
        <Route path="/manage-expenses" element={<ManageExpenses />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
