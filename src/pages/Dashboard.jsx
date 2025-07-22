import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import StatCard from '../components/StatCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import PageHeader from '../components/PageHeader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats/summary').then(res => setStats(res.data));
  }, []);

  if (!stats) return null;

  return (
    <MainLayout title="Festival Summary Dashboard">
        <PageHeader/>
      <Grid container spacing={3}>

        {/* Summary Cards */}
        <Grid item xs={12} sm={4}><StatCard label="Total Donations" value={stats.totalDonations} /></Grid>
        <Grid item xs={12} sm={4}><StatCard label="Total Expenses" value={stats.totalExpenses} /></Grid>
        <Grid item xs={12} sm={4}><StatCard label="Balance" value={stats.balance} /></Grid>

        {/* Line Chart: Daily Donation Trend */}
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyDonations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Donations" />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Line Chart: Daily Expense Trend */}
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#ff7300" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        {/* Pie Chart: Payment Mode */}
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.paymentModeBreakdown).map(([key, val]) => ({ name: key, value: val }))}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {Object.keys(stats.paymentModeBreakdown).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        {/* Bar Chart: Expense by Category */}
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(stats.expenseByCategory).map(([cat, amt]) => ({ category: cat, amount: amt }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

      </Grid>
    </MainLayout>
  );
};

export default Dashboard;
