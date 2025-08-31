// src/pages/StatsPage.jsx
import React, { useEffect, useState } from "react";
import {Container,Grid,Card,CardContent,Typography,Box,Chip,Avatar,Divider,Dialog,DialogTitle,DialogContent,DialogActions,Button,} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import api from "../api/axios";
import MainLayout from "../layout/MainLayout";
import PageHeader from '../components/PageHeader';
import Confetti from "react-confetti";
import { Slider } from "@mui/material";
import { useCelebration } from "../context/CelebrationContext";

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { triggerCelebration } = useCelebration();
  // Add new state for locked milestone dialog
  const [lockedDialog, setLockedDialog] = useState({
    open: false,
    milestone: null,
    remaining: 0
  });


  const donationMilestones = [25000, 50000, 75000, 100000];
  // 🎯 Milestone definitions
const milestoneLabels = {
  25000: "🧱 Brick by Brick",
  50000: "🥈 Silver Supporter",
  75000: "🥇 Gold Giver",
  100000: "💎 Diamond Donor",
};

const collectiveTitles = [
  "🧱 Brick by Brick",
  "🤝 Community Champions",
  "🎊 Festival Force",
  "🏡 Society Superstars",
  "🌈 Unity Builders",
  "🔥 Neighborhood Ninjas",
  "🚀 Together We Rise",
  "🌟 Celebration Legends",
  "🥳 Blockbuster Benefactors",
  "💎 Diamond Collective"
];


  // 🎉 Celebration state
  const [celebrate, setCelebrate] = useState(false);
  const [latestMilestone, setLatestMilestone] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const params = { isExternal: false };
      const res = await api.get("/stats/donations", { params });
      const payload = res?.data ?? null;
      setStats(normalizeStats(payload));
    } catch (err) {
      console.error("Error fetching stats:", err);
      alert("Error fetching stats.");
    } finally {
      setLoading(false);
    }
  }

  function normalizeStats(raw) {
    if (!raw) return null;

    // Early bird donor
    let earlyBird = null;
    if (raw.earlyBirdDonator) {
      earlyBird = {
        name: raw.earlyBirdDonator,
      };
    } else if (raw.firstDonor) {
      earlyBird = {
        name: raw.firstDonor.name ?? raw.firstDonor.donorName,
        building: raw.firstDonor.building,
        roomNumber: raw.firstDonor.roomNumber ?? raw.firstDonor.room,
        amount: raw.firstDonor.amount,
        date: raw.firstDonor.date,
      };
    }

    // Building leaders
    const buildingLeaders = {
      highest: raw.highestDonatingBuilding
        ? {
            building: raw.highestDonatingBuilding,
            total: raw.highestBuildingAmount,
          }
        : null,
      lowest: raw.leastDonatingBuilding
        ? {
            building: raw.leastDonatingBuilding,
            total: raw.leastBuildingAmount,
          }
        : null,
    };

    // Top donors
    const topDonors = (raw.topDonators ?? []).map((d) => ({
      name:
        d.name ??
        d.donorName ??
        (d.building && (d.roomNumber ?? d.room)
          ? `${d.building}-${d.roomNumber ?? d.room}`
          : d.building ?? "Anonymous"),
      building: d.building,
      roomNumber: d.roomNumber ?? d.room,
      total: d.totalAmount ?? d.amount ?? d.total ?? 0,
    }));

    return {
      totalDonations:
        raw.totalDonations ??
        raw.totalDonation ??
        raw.total ??
        raw.total_donations ??
        0,
      earlyBird,
      buildingLeaders,
      topDonors,
    };
  }
    useEffect(() => {
      window.triggerCelebration = triggerCelebration;
      return () => {
        delete window.triggerCelebration; // cleanup on unmount
      };
    }, []);
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Loading stats...</Typography>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">No stats available</Typography>
      </Container>
    );
  }

  const donationAchieved = donationMilestones.filter(
    (m) => stats.totalDonations >= m
  );

// Base step for milestones
const baseStep = 25000;

// Compute max slider value dynamically (next multiple of 25k above total donations)
const maxDonation = Math.max(...donationMilestones, stats.totalDonations);
const dynamicMax =
  Math.ceil(maxDonation / baseStep) * baseStep + baseStep;

// Extend milestones list
const dynamicMilestones = [...donationMilestones];
while (dynamicMilestones[dynamicMilestones.length - 1] < dynamicMax) {
  dynamicMilestones.push(dynamicMilestones[dynamicMilestones.length - 1] + baseStep);
}

// Build milestone labels dynamically
// Build milestone labels dynamically
const milestoneNames = { ...milestoneLabels };
dynamicMilestones.forEach((m, idx) => {
  if (!milestoneNames[m]) {
    const fallback = collectiveTitles[idx % collectiveTitles.length];
    milestoneNames[m] = `${fallback} (₹${m.toLocaleString()})`;
  }
});



  return (
    <MainLayout title="Stats & Milestones">
    <Container sx={{ mt: 4 }}>
    <PageHeader />
      <Typography variant="h3" gutterBottom>
        🏆 Festival Leaderboard
      </Typography>

      <Grid container spacing={3}>
        {/* Early Bird */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🐣 Early Bird Donor
            </Typography>
            {stats.earlyBird ? (
              <>
                <Typography variant="body1" fontWeight="bold">
                  {stats.earlyBird.name}
                </Typography>
                {stats.earlyBird.building && (
                  <Typography variant="body2" color="text.secondary">
                    {stats.earlyBird.building}
                    {stats.earlyBird.roomNumber
                      ? ` - ${stats.earlyBird.roomNumber}`
                      : ""}
                  </Typography>
                )}
                {stats.earlyBird.amount != null && (
                  <Typography
                    variant="body1"
                    color="primary"
                    fontWeight="bold"
                    sx={{ mt: 1 }}
                  >
                    💰 ₹{stats.earlyBird.amount}
                  </Typography>
                )}
                {stats.earlyBird.date && (
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    on {stats.earlyBird.date}
                  </Typography>
                )}
              </>
            ) : (
              <Typography>No donations yet</Typography>
            )}
          </CardContent>
          </Card>
        </Grid>

        {/* Generous Building */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏢 Santa of the Society
              </Typography>
              <Typography variant="body1">
                {stats.buildingLeaders?.highest?.building ?? "—"}
              </Typography>
              {stats.buildingLeaders?.highest?.total != null && (
                <Typography variant="body1" color="primary" fontWeight="bold">
                  💰 ₹{stats.buildingLeaders.highest.total}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Miser Building */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                😂 Chai-Samosa Donor
              </Typography>
              <Typography variant="body1">
                {stats.buildingLeaders?.lowest?.building ?? "—"}
              </Typography>
              {stats.buildingLeaders?.lowest?.total != null && (
                <Typography variant="body1" color="primary" fontWeight="bold">
                  💸 ₹{stats.buildingLeaders.lowest.total}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Donors */}
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>
          🥇 Top 3 Donators
        </Typography>
        <Grid container spacing={3}>
          {stats.topDonors.length === 0 && (
            <Grid item xs={12}>
              <Typography>No donors yet</Typography>
            </Grid>
          )}

            {stats.topDonors.slice(0, 3).map((donor, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: idx === 0 ? "gold" : idx === 1 ? "silver" : "peru",
                        mx: "auto",
                        mb: 1,
                        width: 56,
                        height: 56,
                      }}
                    >
                      <EmojiEventsIcon />
                    </Avatar>

                    {/* Donor Name (building-room already included if no donorName exists) */}
                    <Typography variant="h6" fontWeight="bold">
                      {donor.name}
                    </Typography>

                    {/* Amount (highlighted) */}
                    <Typography
                      variant="body1"
                      color="primary"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                    >
                      💰 ₹{donor.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Milestones */}
         
          <Box mt={5}>
            <Typography variant="h5">🎯 Milestones</Typography>
            <Divider sx={{ my: 2 }} />

            {/* Progress Bar */}
            <Box px={2} mt={4}>
              <Slider
                value={stats.totalDonations}
                min={0}
                max={dynamicMax}
                step={1000}
                marks={dynamicMilestones.map(m => ({
                  value: m,
                  label: milestoneNames[m]   // ✅ use dynamic milestoneNames
                }))}
                valueLabelDisplay="on"
                sx={{
                  "& .MuiSlider-markLabel": { fontSize: "0.8rem" },
                  "& .MuiSlider-valueLabel": { fontSize: "0.9rem" }
                }}
              />
            </Box>

            {/* Clickable Milestone Chips */}
            <Box
              display="flex"
              justifyContent="center"
              flexWrap="wrap"
              gap={2}
              mt={3}
            >
           {dynamicMilestones.map(m => {
            const achieved = stats.totalDonations >= m;
              return (
                <Chip
                  key={m}
                  label={milestoneNames[m]}
                  color={achieved ? "success" : "default"}
                  variant={achieved ? "filled" : "outlined"}
                onClick={() => {
                  if (achieved) {
                    triggerCelebration(m);
                  } else {
                    const remaining = m - stats.totalDonations;
                    setLockedDialog({
                      open: true,
                      milestone: m,
                      remaining
                    });
                  }
                }}
                />
              );
            })}
            </Box>
          </Box>

      {/* 🎉 Confetti Celebration */}
      {celebrate && (
        <Confetti width={windowSize.width} height={windowSize.height} />
      )}

      {/* 🎉 Milestone Unlock Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🎉 Congratulations!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            You’ve unlocked the <b>₹{latestMilestone}</b> milestone!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thank you to all our amazing donors for making this possible!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Awesome 🚀
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔒 Locked milestone dialog */}
          <Dialog
            open={lockedDialog.open}
            onClose={() => setLockedDialog({ ...lockedDialog, open: false })}
          >
            <DialogTitle>🔒 Milestone Locked</DialogTitle>
            <DialogContent>
              <Typography variant="h6">
                {milestoneNames[lockedDialog.milestone]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You need <b>₹{lockedDialog.remaining.toLocaleString()}</b> more to unlock this milestone!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setLockedDialog({ ...lockedDialog, open: false })}
                variant="outlined"
              >
                Got it 👍
              </Button>
            </DialogActions>
          </Dialog>
    </Container>
    </MainLayout>
  );
}
