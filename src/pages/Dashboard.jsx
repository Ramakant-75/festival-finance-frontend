// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { saveAs } from 'file-saver';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC', '#33B5E5'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(currentYear);
  const [userRole, setUserRole] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0); // ✅ new state

  useEffect(() => {
    api.get(`/stats/summary?year=${year}`).then(res => setStats(res.data));
  }, [year]);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUserRole(res.data.role))
      .catch(() => setUserRole(null));
  }, []);

  // ✅ fetch totalPaid when year changes
  useEffect(() => {
    api.get(`/expenses/total-paid?year=${year}`)
      .then(res => setTotalPaid(res.data))
      .catch(() => setTotalPaid(0));
  }, [year]);

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

  // total for percentage
  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <MainLayout title="Festival Summary Dashboard">
      <Box sx={{ mt: 8 }}>
        <PageHeader />

        {/* Filter & PDF button */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          px={3}
          mt={2}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
              {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleGeneratePdf}>
            📄 Generate Festival PDF Report
          </Button>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={3} mt={2} px={3}>
          <Grid item xs={12} md={3}>
            <StatCard label="Total Donations" value={stats.totalDonations} />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard label="Total Expenses" value={stats.totalExpenses} />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard label="Balance" value={stats.balance} />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard label="Total Paid" value={totalPaid} /> {/* ✅ new card */}
          </Grid>
        </Grid>

        {/* Pie Chart */}
        <Grid container spacing={1} mt={3} px={2} justifyContent="center">
          <Grid item xs={12} md={12}> {/* full width now */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom align="center">
                  🥧 Festival Expense Distribution by Category
                </Typography>

                <Box sx={{ width: '100%', height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="35%"
                        outerRadius="80%"   // bigger radius for horizontal scaling
                        label={({ name, value, percent }) =>
                          `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                        }
                        labelLine={true}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const percent = ((value / total) * 100).toFixed(1);
                          return [`₹${value.toLocaleString()} (${percent}%)`, name];
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
