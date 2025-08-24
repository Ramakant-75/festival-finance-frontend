import React, { useEffect, useState } from "react";
import { Container, Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Call your backend API to fetch stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  if (!stats) {
    return (
      <Container>
        <Typography variant="h6">Loading stats...</Typography>
      </Container>
    );
  }

  // Define milestones
  const donationMilestones = [25000, 50000, 75000, 100000];
  const expenseMilestones = [40000, 50000, 80000, 100000];

  const donationAchieved = donationMilestones.filter(m => stats.totalDonations >= m);
  const expenseAchieved = expenseMilestones.filter(m => stats.totalExpenses >= m);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🏆 Festival Leaderboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Top Building</Typography>
              <Typography variant="body1">{stats.topBuilding.name}</Typography>
              <Typography variant="body2">₹{stats.topBuilding.amount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Top Room</Typography>
              <Typography variant="body1">{stats.topRoom.name}</Typography>
              <Typography variant="body2">₹{stats.topRoom.amount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">First Donor</Typography>
              <Typography variant="body1">{stats.firstDonor.name}</Typography>
              <Typography variant="body2">on {stats.firstDonor.date}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Milestones */}
      <Box mt={5}>
        <Typography variant="h5">🎯 Milestones</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          {donationAchieved.map((m) => (
            <Chip key={m} label={`Donation Milestone ₹${m}`} color="success" />
          ))}
          {expenseAchieved.map((m) => (
            <Chip key={m} label={`Expenditure Milestone ₹${m}`} color="error" />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
