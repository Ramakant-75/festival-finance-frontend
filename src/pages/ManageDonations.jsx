import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button, Snackbar, Alert, Paper, Box, Pagination, Stack
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import PageHeader from '../components/PageHeader';
import api from '../api/axios';
import { saveAs } from 'file-saver';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
const pageSizeOptions = [10, 20, 50];

const ManageDonations = () => {
  const [year, setYear] = useState(currentYear);
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [success, setSuccess] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [buildingFilter, setBuildingFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  useEffect(() => {
    fetchDonations(year, page - 1, pageSize, buildingFilter, paymentModeFilter, dateFilter);
    fetchSummary(year);
  }, [year, page, pageSize, buildingFilter, paymentModeFilter, dateFilter]);

  const fetchDonations = async (yr, pg, sz, building, paymentMode, date) => {
    try {
      const params = { year: yr, page: pg, size: sz };
      if (building) params.building = building;
      if (paymentMode) params.paymentMode = paymentMode;
      if (date) params.date = date.toISOString().split('T')[0];
      const res = await api.get('/donations', { params });
      setDonations(res.data.content);
      setTotalPages(res.data.totalPages);
      setEditRow(null);
    } catch (err) {
      alert("Error fetching donations.");
    }
  };

  const fetchSummary = async (yr) => {
    try {
      const res = await api.get('/stats/summary', { params: { year: yr } });
      setSummary(res.data);
    } catch {
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
      const payload = { ...editRow, amount: updatedAmount };
      delete payload.adjustment;

      await api.put(`/donations/${editRow.id}`, payload);
      setSuccess(true);
      setHighlightedId(editRow.id);

      fetchDonations(year, page - 1, pageSize, buildingFilter, paymentModeFilter, dateFilter);
      fetchSummary(year);

      setTimeout(() => setHighlightedId(null), 3000);
    } catch {
      alert("Error updating donation.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <PageHeader />
      <Typography variant="h4" gutterBottom>🛠 Manage Room‑Wise Donations</Typography>

      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year"
              onChange={e => { setYear(e.target.value); setPage(1); }}>
              {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Building</InputLabel>
            <Select value={buildingFilter} label="Building"
              onChange={e => { setBuildingFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {donations.map(d => d.building).filter((v,i,a)=>a.indexOf(v)===i).map(b => (
                <MenuItem key={b} value={b}>{b}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Payment Mode</InputLabel>
            <Select value={paymentModeFilter} label="Payment Mode"
              onChange={e => { setPaymentModeFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {["CASH","CHEQUE","UPI"].map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={dateFilter}
              onChange={newVal => { setDateFilter(newVal); setPage(1); }}
              renderInput={(params) => <TextField size="small" {...params} />}
            />
          </LocalizationProvider>

          <Button size="small" onClick={() => {
            setBuildingFilter('');
            setPaymentModeFilter('');
            setDateFilter(null);
            setPage(1);
          }}>Reset Filters</Button>

          {summary && (
            <Typography variant="h6" color="green" sx={{ ml: 'auto' }}>
              💰 Total Collection: ₹ {summary.totalDonations.toFixed(2)}
            </Typography>
          )}

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows / page</InputLabel>
            <Select value={pageSize} label="Rows / page"
              onChange={e => { setPageSize(e.target.value); setPage(1); }}>
              {pageSizeOptions.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 2 }}
            onClick={async () => {
              try {
                const res = await api.get('/export/donations', {
                  params: {
                    year,
                    building: buildingFilter || undefined,
                    paymentMode: paymentModeFilter || undefined,
                    date: dateFilter ? dateFilter.toISOString().split('T')[0] : undefined
                  },
                  responseType: 'blob'
                });
                saveAs(new Blob([res.data]), 'donations.xlsx');
              } catch {
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
            {donations.map(d => {
              const isEditing = editRow?.id === d.id;
              const isHighlighted = highlightedId === d.id;
              return (
                <TableRow key={d.id} sx={isHighlighted ? { backgroundColor: '#e6f4ea' } : {}}>
                  <TableCell>{d.building}</TableCell>
                  <TableCell>{d.roomNumber}</TableCell>
                  <TableCell>₹ {d.amount}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <FormControl size="small" fullWidth>
                        <Select value={editRow.paymentMode} onChange={e => handleEditChange(e, 'paymentMode')}>
                          {["CASH","CHEQUE","UPI"].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </Select>
                      </FormControl>
                    ) : d.paymentMode}
                  </TableCell>
                  <TableCell>{new Date(d.date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField size="small" value={editRow.remarks || ''} onChange={e => handleEditChange(e, 'remarks')} />
                    ) : d.remarks}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField type="number" size="small" value={editRow.adjustment || ''} onChange={e => handleEditChange(e, 'adjustment')} placeholder="+/- ₹" />
                    ) : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {isEditing ? (
                      <Button size="small" variant="contained" onClick={handleSave}>💾 Save</Button>
                    ) : (
                      <Button size="small" variant="outlined" onClick={() => setEditRow({ ...d, adjustment: 0 })}>✏️ Edit</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Stack alignItems="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Stack>
      </Paper>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>✅ Donation updated successfully!</Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageDonations;
