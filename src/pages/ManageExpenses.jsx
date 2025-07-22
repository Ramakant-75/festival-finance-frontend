import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Button, Snackbar, Alert, Typography, Box
} from '@mui/material';
import { saveAs } from 'file-saver';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import PageHeader from '../components/PageHeader';

const categories = ["Decoration", "Food", "Sound", "Lighting", "Misc"];

const ManageExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [edited, setEdited] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [success, setSuccess] = useState(false);
  const [updatedRowId, setUpdatedRowId] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await api.get('/expenses');
    setExpenses(res.data);
    const sum = res.data.reduce((acc, curr) => acc + curr.amount, 0);
    setTotal(sum);
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

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/expenses/${id}/receipt`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      saveAs(blob, `receipt-${id}.jpg`);
    } catch (err) {
      alert("Failed to download receipt.");
    }
  };

  return (
    <MainLayout title="Manage Expenses">
      <PageHeader />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>💸 Manage Festival Expenses</Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          🔢 Total Expenses: ₹ {total.toFixed(2)}
        </Typography>

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
                <TableCell>Receipt</TableCell>
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
                    {e.hasReceipt ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDownload(e.id)}
                      >
                        📎 View
                      </Button>
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
