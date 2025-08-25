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
  CardContent,
  Container
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { saveAs } from 'file-saver';

// 🎨 Distinct color palette (Tableau 20 / D3 Category20)
const distinctColors = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#393b79", "#637939", "#8c6d31", "#843c39", "#7b4173",
  "#3182bd", "#31a354", "#756bb1", "#636363", "#e6550d"
];

// ✅ fallback generator if categories > palette length
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 45%)`; // consistent fallback
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(currentYear);
  const [userRole, setUserRole] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    api.get(`/stats/summary?year=${year}`).then(res => setStats(res.data));
  }, [year]);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUserRole(res.data.role))
      .catch(() => setUserRole(null));
  }, []);

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

  const chartData = Object.entries(stats.expenseByCategory || {}).map(([key, val]) => ({
    name: key,
    value: val,
  }));

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
            <StatCard label="Total Paid" value={totalPaid} />
          </Grid>
        </Grid>

        {/* ✅ Full-Width Chart */}
        <Box sx={{ mt: 4 }}>
          <Container maxWidth={false} disableGutters>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom align="center">
                  📊 Festival Expense Distribution by Category
                </Typography>
                <Box sx={{ width: '100%', height: 500 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
                      barCategoryGap="20%" // more breathing room
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="value" name="Expense Amount">
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={distinctColors[index] || stringToColor(entry.name)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
