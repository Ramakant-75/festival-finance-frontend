import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button, Snackbar, Alert, Paper, Box
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import api from '../api/axios';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

const ManageDonations = () => {
  const [year, setYear] = useState(currentYear);
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [success, setSuccess] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    fetchDonations(year);
    fetchSummary(year);
  }, [year]);

  const fetchDonations = async (selectedYear) => {
    try {
      const res = await api.get(`/donations?year=${selectedYear}`);
      setDonations(res.data);
      setEditRow(null);
    } catch (err) {
      alert("Error fetching donations.");
    }
  };

  const fetchSummary = async (selectedYear) => {
    try {
      const res = await api.get(`/stats/summary?year=${selectedYear}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching summary');
    }
  };

  const handleEditChange = (e, field) => {
    const { value } = e.target;
    setEditRow(prev => ({
      ...prev,
      [field]: field === 'adjustment' ? parseFloat(value || 0) : value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedAmount = editRow.amount + (editRow.adjustment || 0);
      const payload = {
        ...editRow,
        amount: updatedAmount
      };
      delete payload.adjustment;

      await api.put(`/donations/${editRow.id}`, payload);
      setSuccess(true);
      setHighlightedId(editRow.id);
      fetchDonations(year);
      fetchSummary();

      setTimeout(() => setHighlightedId(null), 3000);
    } catch (err) {
      alert("Error updating donation.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <PageHeader />
      <Typography variant="h4" gutterBottom>
        🛠 Manage Room-Wise Donations
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Select Year</InputLabel>
            <Select
              value={year}
              label="Select Year"
              onChange={(e) => setYear(e.target.value)}
            >
              {yearOptions.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {summary && (
            <Typography variant="h6" color="green">
              💰 Total Collection: ₹ {summary.totalDonations.toFixed(2)}
            </Typography>
          )}
          <Button
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
              onClick={async () => {
                try {
                  const res = await api.get('/export/donations', {
                    responseType: 'blob'
                  });
                  saveAs(new Blob([res.data]), 'donations.xlsx');
                } catch (err) {
                  alert("Failed to download donations report.");
                }
              }}
            >
              📤 Export Excel
            </Button>
        </Box>

        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Building</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Amount (₹)</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Adjust (±)</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {donations.map((d) => {
              const isEditing = editRow?.id === d.id;
              const isHighlighted = highlightedId === d.id;

              return (
                <TableRow
                  key={d.id}
                  sx={isHighlighted ? { backgroundColor: '#e6f4ea' } : {}}
                >
                  <TableCell>{d.building}</TableCell>
                  <TableCell>{d.roomNumber}</TableCell>
                  <TableCell>₹ {d.amount}</TableCell>

                  <TableCell>
                    {isEditing ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editRow.paymentMode}
                          onChange={(e) => handleEditChange(e, 'paymentMode')}
                        >
                          <MenuItem value="CASH">CASH</MenuItem>
                          <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                          <MenuItem value="UPI">UPI</MenuItem>
                        </Select>
                      </FormControl>
                    ) : d.paymentMode}
                  </TableCell>

                  <TableCell>{new Date(d.date).toLocaleDateString('en-IN')}</TableCell>

                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={editRow.remarks || ''}
                        onChange={(e) => handleEditChange(e, 'remarks')}
                      />
                    ) : d.remarks}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editRow.adjustment || ''}
                        onChange={(e) => handleEditChange(e, 'adjustment')}
                        placeholder="+/- ₹"
                      />
                    ) : "-"}
                  </TableCell>

                  <TableCell align="center">
                    {isEditing ? (
                      <Button size="small" variant="contained" onClick={handleSave}>
                        💾 Save
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setEditRow({ ...d, adjustment: 0 })}
                      >
                        ✏️ Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          ✅ Donation updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageDonations;
