import React, { useEffect, useState } from 'react';
import {
  Grid, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { saveAs } from 'file-saver';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    api.get(`/stats/summary?year=${year}`).then(res => setStats(res.data));
  }, [year]);

  const handleGeneratePdf = async () => {
    const res = await api.get(`/export/festival-report?year=${year}`, {
      responseType: 'blob'
    });
    saveAs(res.data, `festival-report-${year}.pdf`);
  };

  if (!stats) return null;

  return (
    <MainLayout title="Festival Summary Dashboard">
      <PageHeader />

      <Box display="flex" justifyContent="space-between" alignItems="center" px={3}>
        <FormControl size="small">
          <InputLabel>Year</InputLabel>
          <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
            {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleGeneratePdf}>
          📄 Generate Festival PDF Report
        </Button>
      </Box>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={4}><StatCard label="Total Donations" value={stats.totalDonations} /></Grid>
        <Grid item xs={12} sm={4}><StatCard label="Total Expenses" value={stats.totalExpenses} /></Grid>
        <Grid item xs={12} sm={4}><StatCard label="Balance" value={stats.balance} /></Grid>

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
