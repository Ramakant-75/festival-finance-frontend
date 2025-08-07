// MODERNIZED ExpenseForm.jsx with professional UI polish

import { useState } from 'react';
import {
  Grid, TextField, Button, Typography, Snackbar, Alert,
  Paper, Box, MenuItem, Divider, Stack
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const categories = ["Murti", "Banjo", "Mandap", "Pooja Samagri", "Decoration", "Food", "Sound", "Lighting", "Misc"];

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    addedBy: '',
    receiptFiles: []
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paidBy: '',
    note: '',
    paymentMethod: ''
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      receiptFiles: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('category', formData.category);
    data.append('amount', formData.amount);
    data.append('date', formData.date);
    data.append('description', formData.description);
    data.append('addedBy', formData.addedBy);

    formData.receiptFiles.forEach(file => {
      data.append('receipts', file);
    });

    try {
      const res = await api.post('/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newExpenseId = res.data.id;

      if (paymentData.amount) {
        await api.post(`/expenses/${newExpenseId}/payments`, paymentData);
      }

      setSuccess(true);
      setFormData({
        category: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        addedBy: '',
        receiptFiles: []
      });
      setPaymentData({
        amount: '',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paidBy: '',
        note: '',
        paymentMethod: ''
      });
    } catch (err) {
      alert("Error submitting expense: " + err.message);
    }
  };

  return (
    <MainLayout title="Add Expense Entry">
      <Paper elevation={4} sx={{ p: 5, maxWidth: 1080, mx: 'auto', mt: 4, borderRadius: 4 }}>
        <PageHeader />
        <Typography variant="h5" gutterBottom fontWeight={700} mb={3}>💸 Society Festival Expense Entry</Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Expense Section */}
          <Typography variant="subtitle1" fontWeight={600} mb={1}>📋 Expense Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField select required fullWidth label="Category" name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField type="number" required fullWidth label="Total Amount (₹)" name="amount" value={formData.amount} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField type="date" required fullWidth label="Expense Date" name="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField required fullWidth label="Added By" name="addedBy" value={formData.addedBy} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Description" name="description" value={formData.description} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                📎 Upload Receipts (JPG, JPEG, PNG, WEBP)
                <input type="file" hidden accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleFileChange} />
              </Button>
              {formData.receiptFiles.length > 0 && (
                <Typography variant="caption" display="block" mt={1}>
                  Selected: {formData.receiptFiles.map(f => f.name).join(', ')}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Payment Section */}
          <Typography variant="subtitle1" fontWeight={600} mb={1}>💳 Initial Payment Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField required fullWidth label="Payment Amount (₹)" type="number" name="amount" value={paymentData.amount} onChange={handlePaymentChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField required fullWidth label="Paid By" name="paidBy" value={paymentData.paidBy} onChange={handlePaymentChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField required fullWidth label="Payment Date" type="date" name="paymentDate" value={paymentData.paymentDate} onChange={handlePaymentChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Payment Method" name="paymentMethod" value={paymentData.paymentMethod} onChange={handlePaymentChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Note (Optional)" name="note" value={paymentData.note} onChange={handlePaymentChange} />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" mt={4}>
            <Button type="submit" variant="contained" size="large">
              💾 Submit Expense
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          ✅ Expense submitted successfully!
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default ExpenseForm;
