import { useState, useEffect } from 'react';
import {
  Grid, TextField, Button, Typography, Snackbar, Alert, Paper, Box, MenuItem
} from '@mui/material';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const categories = ["Decoration", "Food", "Sound", "Lighting", "Misc"];

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: '',
    description: '',
    addedBy: '',
    receiptFiles: []  // array of multiple files
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      data.append('receipts', file); // must match the @RequestParam name in Spring
    });

    try {
      await api.post('/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setFormData({
        category: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        addedBy: '',
        receiptFiles: []
      });
    } catch (err) {
      alert("Error submitting expense: " + err.message);
    }
  };

  return (
    <MainLayout title="Add Expense Entry">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto', mt: 4 }}>
        <PageHeader />
        <Typography variant="h5" gutterBottom>💸 Society Festival Expense Entry</Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth required label="Category"
                name="category" value={formData.category} onChange={handleChange}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="number" fullWidth required label="Amount (₹)"
                name="amount" value={formData.amount} onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="date" fullWidth required label="Date"
                name="date" value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth required label="Added By"
                name="addedBy" value={formData.addedBy} onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth multiline label="Description"
                name="description" value={formData.description} onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                📎 Upload Receipts (jpg, jpeg, png, webp)
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
              {formData.receiptFiles.length > 0 && (
                <Typography variant="caption" display="block">
                  Selected: {formData.receiptFiles.map(f => f.name).join(', ')}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" size="large">
                💾 Submit Expense
              </Button>
            </Grid>
          </Grid>
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
