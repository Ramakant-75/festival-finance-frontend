import { useState, useEffect } from 'react';
import {
  Grid, TextField, MenuItem, Button, Typography, Snackbar, Alert, Paper, Box,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const buildings = [
  { name: "D-1", floors: 2 },
  { name: "D-2", floors: 3 },
  { name: "D-3", floors: 2 },
  { name: "D-4", floors: 3 },
  { name: "D-5", floors: 3 },
  { name: "D-6", floors: 2 },
  { name: "D-7", floors: 3 }
];

const floorRoomMap = {
  0: ["001", "002", "003", "004"],
  1: ["101", "102", "103", "104"],
  2: ["201", "202", "203", "204"],
  3: ["301", "302", "303", "304"]
};

const paymentModes = ["CASH", "CHEQUE", "UPI"];

const DonationForm = () => {
  const [formData, setFormData] = useState({
    isExternal: false,
    name: '',
    building: '',
    floor: '',
    room: '',
    amount: '',
    paymentMode: '',
    date: '',
    remarks: ''
  });

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const [success, setSuccess] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);   // 🎉 New
  const [latestMilestone, setLatestMilestone] = useState(null); // 🎉 New
  const { width, height } = useWindowSize();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "isExternal") {
      setFormData(prev => ({
        ...prev,
        isExternal: value === "true",
        name: "",
        building: "",
        floor: "",
        room: ""
      }));
      return;
    }

    if (name === 'building') {
      setFormData({
        ...formData,
        building: value,
        floor: '',
        room: ''
      });
    } else if (name === 'floor') {
      setFormData((prev) => ({
        ...prev,
        floor: value,
        room: ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isExternal, name, building, floor, room, amount, paymentMode, date } = formData;

    if (!amount || !paymentMode || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isExternal) {
      if (!name) {
        alert("Please enter donor name for external donation.");
        return;
      }
    } else {
      if (!building || floor === '' || !room) {
        alert("Please fill in building, floor and room.");
        return;
      }

      const donationYear = new Date(date).getFullYear();
      const existsRes = await api.get(`/donations/exists?building=${building}&roomNumber=${room}&year=${donationYear}`);
      if (existsRes.data === true) {
        alert("Donation already exists for this room. Go to Manage Donations to update.");
        window.location.href = "/manage-donations";
        return;
      }
    }

    const payload = {
      isExternal,
      name: isExternal ? name : null,
      building: isExternal ? null : building,
      roomNumber: isExternal ? null : room,
      amount: parseFloat(amount),
      paymentMode,
      date,
      remarks: formData.remarks
    };

    try {
      const res = await api.post('/donations', payload);
      setSuccess(true);

      // ⚡ Check for unlocked milestones
      if (res?.data?.unlockedMilestones?.length > 0) {
        const latest = res.data.unlockedMilestones[res.data.unlockedMilestones.length - 1];
        console.log("🎉 Milestone unlocked:", latest);
        setLatestMilestone(latest);
        setConfetti(true);   // instant confetti
        setOpenDialog(true); // instant dialog
        setTimeout(() => setConfetti(false), 6000);
      }

      // reset form
      setFormData({
        isExternal: false,
        name: '',
        building: '',
        floor: '',
        room: '',
        amount: '',
        paymentMode: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        remarks: ''
      });
    } catch (err) {
      alert("Error submitting donation: " + err.message);
    }
  };

  const selectedBuilding = buildings.find(b => b.name === formData.building);
  const availableFloors = selectedBuilding
    ? Array.from({ length: selectedBuilding.floors + 1 }, (_, i) => i)
    : [];
  const availableRooms = floorRoomMap[formData.floor] || [];

  return (
    <MainLayout title="Add Donation Entry">
      {/* ⚡ Confetti will now always have proper size */}
      {confetti && (
        <Confetti
          width={width || window.innerWidth}
          height={height || window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto', mt: 4 }}>
        <PageHeader />
        <Typography variant="h5" gutterBottom>
          🏠 Society Festival Contribution Form
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please select donor type and enter details.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Donor Type */}
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth required label="Donor Type"
                name="isExternal" value={formData.isExternal.toString()} onChange={handleChange}
              >
                <MenuItem value="false">Society Member</MenuItem>
                <MenuItem value="true">External Donor</MenuItem>
              </TextField>
            </Grid>

            {/* Conditional Fields */}
            {formData.isExternal ? (
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth required label="Donor Name"
                  name="name" value={formData.name} onChange={handleChange}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select fullWidth required label="Building"
                    name="building" value={formData.building} onChange={handleChange}
                  >
                    {buildings.map(b => (
                      <MenuItem key={b.name} value={b.name}>{b.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select fullWidth required label="Floor"
                    name="floor" value={formData.floor} onChange={handleChange}
                    disabled={!formData.building}
                  >
                    {availableFloors.map(f => (
                      <MenuItem key={f} value={f}>
                        {f === 0 ? "Ground Floor (0)" : `${f}ᵗʰ Floor`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select fullWidth required label="Room Number"
                    name="room" value={formData.room} onChange={handleChange}
                    disabled={!formData.floor && formData.floor !== 0}
                  >
                    {availableRooms.map(r => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={4}>
              <TextField
                type="number" fullWidth required label="Donation Amount (₹)"
                name="amount" value={formData.amount} onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth required label="Payment Mode"
                name="paymentMode" value={formData.paymentMode} onChange={handleChange}
              >
                {paymentModes.map(mode => (
                  <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type="date" fullWidth required label="Donation Date"
                name="date" value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth multiline label="Remarks (Optional)"
                name="remarks" value={formData.remarks} onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" size="large">
                💾 Submit Donation
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          🎉 Donation submitted successfully!
        </Alert>
      </Snackbar>

      {/* 🎉 Milestone Unlock Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🎉 Milestone Unlocked!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            You just unlocked the <b>₹{latestMilestone}</b> milestone 🚀
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amazing contribution! Thank you for helping us reach this goal.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Awesome 🎊
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default DonationForm;
