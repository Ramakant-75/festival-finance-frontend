import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Button, Snackbar, Alert, Typography, Box,
  FormControl,InputLabel,Select
} from '@mui/material';
import { saveAs } from 'file-saver';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import PageHeader from '../components/PageHeader';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);


const categories = ["Decoration", "Food", "Sound", "Lighting", "Misc"];

const ManageExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [edited, setEdited] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [success, setSuccess] = useState(false);
  const [updatedRowId, setUpdatedRowId] = useState(null);
  const [total, setTotal] = useState(0);
  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    fetchExpenses(year);
  }, [year]);

  const fetchExpenses = async (selectedYear = year) => {
    try {
      const res = await api.get(`/expenses?year=${selectedYear}`);
      setExpenses(res.data);
      const sum = res.data.reduce((acc, curr) => acc + curr.amount, 0);
      setTotal(sum);
    } catch (err) {
      alert("Error fetching expenses.");
    }
  };  

  const handleFieldChange = (id, field, value) => {
    setEdited(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleAdjustmentChange = (id, value) => {
    setAdjustments(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSave = async (id) => {
    const original = expenses.find(e => e.id === id);
    const updated = {
      ...original,
      ...edited[id],
      amount: parseFloat(original.amount) + parseFloat(adjustments[id] || 0)
    };

    try {
      await api.put(`/expenses/${id}`, updated);
      setSuccess(true);
      setUpdatedRowId(id);
      fetchExpenses();
      setEdited(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setAdjustments(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (err) {
      alert("Failed to update expense: " + err.message);
    }
  };

  // const handleDownload = async (expenseId, receiptId, filename) => {
  //   try {
  //     const response = await api.get(`/expenses/${expenseId}/receipts/${receiptId}`, {
  //       responseType: 'blob'
  //     });
  //     const blob = new Blob([response.data]);
  //     saveAs(blob, filename || `receipt-${expenseId}.jpg`);
  //   } catch (err) {
  //     alert("Failed to download receipt.");
  //   }
  // };
  const handleDownload = async (expenseId, receiptId, filename) => {
    try {
      const response = await api.get(`/expenses/${expenseId}/receipts/${receiptId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      saveAs(blob, filename || `receipt-${receiptId}.jpg`);
    } catch (err) {
      alert("Failed to download receipt.");
    }
  };
  

  return (
    <MainLayout title="Manage Expenses">
      <PageHeader />
      <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
  <Box display="flex" gap={2} alignItems="center">
    <Typography variant="h5">💸 Manage Festival Expenses</Typography>

    <FormControl size="small">
      <InputLabel>Select Year</InputLabel>
      <Select
        value={year}
        label="Select Year"
        onChange={(e) => setYear(e.target.value)}
        sx={{ minWidth: 120 }}
      >
        {yearOptions.map(y => (
          <MenuItem key={y} value={y}>{y}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>

  <Box display="flex" alignItems="center">
    <Typography variant="h6" color="primary">
      🔢 Total Expenses: ₹ {total.toFixed(2)}
    </Typography>

    <Button
      variant="outlined"
      size="small"
      sx={{ ml: 2 }}
      onClick={async () => {
        try {
          const res = await api.get('/export/expenses', {
            responseType: 'blob'
          });
          saveAs(new Blob([res.data]), 'expenses.xlsx');
        } catch (err) {
          alert("Failed to download expenses report.");
        }
      }}
    >
      📤 Export Excel
    </Button>
  </Box>
</Box>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Adjustment (±)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Receipts</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id} sx={{ backgroundColor: updatedRowId === e.id ? '#f1f8e9' : 'inherit' }}>
                  <TableCell>
                    <TextField
                      select size="small"
                      value={edited[e.id]?.category || e.category}
                      onChange={(evt) => handleFieldChange(e.id, 'category', evt.target.value)}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      value={e.amount}
                      InputProps={{ readOnly: true }}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="± Amount"
                      value={adjustments[e.id] || ''}
                      onChange={(evt) => handleAdjustmentChange(e.id, evt.target.value)}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={edited[e.id]?.date || e.date}
                      onChange={(evt) => handleFieldChange(e.id, 'date', evt.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      value={edited[e.id]?.description || e.description}
                      onChange={(evt) => handleFieldChange(e.id, 'description', evt.target.value)}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      value={edited[e.id]?.addedBy || e.addedBy}
                      onChange={(evt) => handleFieldChange(e.id, 'addedBy', evt.target.value)}
                    />
                  </TableCell>

                                    <TableCell>
                    {e.hasReceipt && e.receipts?.length > 0 ? (
                      <Box display="flex" flexDirection="column" gap={1}>
                        {e.receipts.map((r, idx) => (
                          <Button
                            key={r.id}
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownload(e.id, r.id, r.fileName)}
                          >
                            📎 {r.fileName || `Receipt ${idx + 1}`}
                          </Button>
                        ))}
                      </Box>
                    ) : (
                      "No Receipt"
                    )}
                  </TableCell>

                  <TableCell>
                    <Button variant="contained" size="small" onClick={() => handleSave(e.id)}>💾 Save</Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No expenses recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          ✅ Expense updated successfully!
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default ManageExpenses;
