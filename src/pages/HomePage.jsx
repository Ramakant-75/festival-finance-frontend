import React from 'react';
import { Button, Container, Typography, Stack, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import LocalGasStationSharp from '@mui/icons-material/LocalGasStationSharp';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const theme = useTheme(); // 👈 detect theme mode

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 0px 8px rgba(0,0,0,0.3)' },
  };

  return (
    <MainLayout title="Society Festival Portal">
      <Container
        maxWidth="md"
        sx={{
          textAlign: 'center',
          mt: 6,
          color: theme.palette.text.primary, // 👈 ensures text adapts to theme
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            gutterBottom
            fontWeight="bold"
            color="inherit" // 👈 inherit from container's text color
          >
            Welcome to Society Festival Portal
          </Typography>
          <Typography
            variant="subtitle1"
            gutterBottom
            color="inherit" // 👈 inherit readable color
          >
            Please choose an action to proceed
          </Typography>
        </motion.div>

        <Stack spacing={3} sx={{ mt: 6 }}>
          {[
            { label: 'View Report Dashboard', icon: <BarChartIcon />, path: '/report', variant: 'contained' },
            { label: 'Add Donation', icon: <VolunteerActivismIcon />, path: '/donate' },
            { label: 'Add Expense', icon: <MoneyOffIcon />, path: '/expenses' },
            { label: 'Manage Donations', icon: <BarChartIcon />, path: '/manage-donations' },
            { label: 'Manage Expenses', icon: <BarChartIcon />, path: '/manage-expenses' },
            // { label: 'Stats & Milestones', icon: <BarChartIcon />, path: '/milestones' },
            ...(role === 'ROLE_ADMIN'
              ? [{ label: 'AUDIT LOGS', icon: <LocalGasStationSharp />, path: '/audit-logs' }]
              : []),
          ].map((btn, idx) => (
            <motion.div key={idx} whileHover="hover" variants={buttonVariants}>
              <Button
                variant={btn.variant || 'outlined'}
                size="large"
                fullWidth
                startIcon={btn.icon}
                onClick={() => navigate(btn.path)}
                sx={{
                  color:
                    btn.variant === 'contained'
                      ? theme.palette.getContrastText(theme.palette.primary.main) // ensures contained button text has good contrast
                      : theme.palette.text.primary, // outlined buttons use readable text
                  borderColor: btn.variant === 'outlined' ? theme.palette.text.primary : undefined,
                }}
              >
                {btn.label}
              </Button>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default HomePage;
