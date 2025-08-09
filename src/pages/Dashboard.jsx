import React, { useEffect, useState } from 'react';
import {
  Grid, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, Card, CardContent
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';
import { saveAs } from 'file-saver';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC', '#33B5E5'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(currentYear);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    api.get(`/stats/summary?year=${year}`).then(res => setStats(res.data));
  }, [year]);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUserRole(res.data.role))
      .catch(() => setUserRole(null));
  }, []);

  const handleGeneratePdf = async () => {
    try {
      const res = await api.get(`/export/festival-report?year=${year}`, {
        responseType: 'blob'
      });
      saveAs(res.data, `festival-report-${year}.pdf`);
    } catch (err) {
      alert("Failed to generate PDF.");
    }
  };

  if (!stats) return null;

  const pieData = Object.entries(stats.expenseByCategory || {}).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  return (
    <MainLayout title="Festival Summary Dashboard">
      <PageHeader />

      {/* Filter & PDF button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} px={3} mt={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
            {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        {/* PDF Export button is now visible to all users */}
        <Button variant="contained" onClick={handleGeneratePdf}>
          📄 Generate Festival PDF Report
        </Button>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} mt={2} px={3}>
        <Grid item xs={12} md={4}>
          <StatCard label="Total Donations" value={stats.totalDonations} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Total Expenses" value={stats.totalExpenses} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Balance" value={stats.balance} />
        </Grid>
      </Grid>

      {/* Pie Chart */}
      <Grid container spacing={3} mt={1} px={3} justifyContent="center">
        <Grid item xs={12} md={10}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom align="center">
                🥧 Festival Expense Distribution by Category
              </Typography>

              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      label={({ name, value, percent }) =>
                        `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                      }
                      labelLine={true}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹ ${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Dashboard;
