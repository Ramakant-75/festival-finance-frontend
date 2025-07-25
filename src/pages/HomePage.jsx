import React from 'react';
import { Button, Container, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MainLayout from '../layout/MainLayout';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout title="Society Festival Portal">
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Welcome to Society Festival Portal
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Please choose an action to proceed
        </Typography>

        <Stack spacing={3} sx={{ mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/report')}
          >
            View Report Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<VolunteerActivismIcon />}
            onClick={() => navigate('/donate')}
          >
            Add Donation
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<MoneyOffIcon />}
            onClick={() => navigate('/expenses')}
          >
            Add Expense
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/manage-donations')}
          >
            Manage Donations
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/manage-expenses')}
          >
            Manage Expenses
          </Button>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default HomePage;
