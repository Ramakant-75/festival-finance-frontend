import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Button, Snackbar, Alert, Typography, Box,
  FormControl, InputLabel, Select, Pagination, Stack
} from '@mui/material';
import { saveAs } from 'file-saver';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
const categories = ["Decoration", "Food", "Sound", "Lighting", "Misc"];
const pageSizeOptions = [10, 20, 50];

const ManageExpenses = () => {
  const { role } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [edited, setEdited] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [success, setSuccess] = useState(false);
  const [updatedRowId, setUpdatedRowId] = useState(null);

  const [year, setYear] = useState(currentYear);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [addedByFilter, setAddedByFilter] = useState('');
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchExpenses();
    console.log('role bc : ' , role);
    fetchTotal();
  }, [year, categoryFilter, addedByFilter, page, pageSize]);

  const fetchExpenses = async () => {
    try {
      const params = {
        year,
        category: categoryFilter || undefined,
        addedBy: addedByFilter || undefined,
        page: page - 1,
        size: pageSize,
      };
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      alert("Error fetching expenses.");
    }
  };

  const fetchTotal = async () => {
    try {
      const params = {
        year,
        category: categoryFilter || undefined,
        addedBy: addedByFilter || undefined,
      };
      const res = await api.get('/expenses/total', { params });
      setTotal(res.data);
    } catch (err) {
      console.error("Error fetching total expenses.");
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
      fetchTotal();
  
      // Clear edited and adjustments
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
  
      // 🔄 Reset row highlight after 3 seconds
      setTimeout(() => setUpdatedRowId(null), 3000);
  
    } catch (err) {
      alert("Failed to update expense.");
    }
  };
  

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
        {/* Filters and summary */}
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={e => { setYear(e.target.value); setPage(1); }}>
              {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} label="Category" onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Added By"
            value={addedByFilter}
            onChange={e => { setAddedByFilter(e.target.value); setPage(1); }}
          />

          <Button size="small" onClick={() => {
            setCategoryFilter('');
            setAddedByFilter('');
            setPage(1);
          }}>Reset Filters</Button>

          <Typography variant="h6" color="green" sx={{ ml: 'auto' }}>
            🔢 Total Expenses: ₹ {total.toFixed(2)}
          </Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows / page</InputLabel>
            <Select value={pageSize} label="Rows / page" onChange={e => { setPageSize(e.target.value); setPage(1); }}>
              {pageSizeOptions.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>

          {role === 'ROLE_ADMIN' && (
            <Button
              variant="outlined"
              size="small"
              onClick={async () => {
                try {
                  const res = await api.get('/export/expenses', {
                    responseType: 'blob'
                  });
                  saveAs(new Blob([res.data]), 'expenses.xlsx');
                } catch {
                  alert("Failed to download expenses report.");
                }
              }}
            >
              📤 Export Excel
            </Button>
          )}
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Adjustment (±)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Receipts</TableCell>
                {role === 'ROLE_ADMIN' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((e, idx) => (
                <TableRow key={e.id} sx={{ backgroundColor: updatedRowId === e.id ? '#7d0fd6' : 'inherit' }}>
                  <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>

                  <TableCell>
                    {role === 'ROLE_ADMIN' ? (
                      <TextField
                        select size="small"
                        value={edited[e.id]?.category || e.category}
                        onChange={(evt) => handleFieldChange(e.id, 'category', evt.target.value)}
                      >
                        {categories.map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </TextField>
                    ) : e.category}
                  </TableCell>

                  <TableCell>₹ {e.amount.toFixed(2)}</TableCell>

                  <TableCell>
                    {role === 'ROLE_ADMIN' ? (
                      <TextField
                        size="small"
                        type="number"
                        placeholder="± Amount"
                        value={adjustments[e.id] || ''}
                        onChange={(evt) => handleAdjustmentChange(e.id, evt.target.value)}
                      />
                    ) : "-"}
                  </TableCell>

                  <TableCell>
                    {role === 'ROLE_ADMIN' ? (
                      <TextField
                        size="small"
                        type="date"
                        value={edited[e.id]?.date || e.date}
                        onChange={(evt) => handleFieldChange(e.id, 'date', evt.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : new Date(e.date).toLocaleDateString('en-IN')}
                  </TableCell>

                  <TableCell>
                    {role === 'ROLE_ADMIN' ? (
                      <TextField
                        size="small"
                        value={edited[e.id]?.description || e.description}
                        onChange={(evt) => handleFieldChange(e.id, 'description', evt.target.value)}
                      />
                    ) : e.description}
                  </TableCell>

                  <TableCell>
                    {role === 'ROLE_ADMIN' ? (
                      <TextField
                        size="small"
                        value={edited[e.id]?.addedBy || e.addedBy}
                        onChange={(evt) => handleFieldChange(e.id, 'addedBy', evt.target.value)}
                      />
                    ) : e.addedBy}
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
                    ) : "No Receipt"}
                  </TableCell>

                  {role === 'ROLE_ADMIN' && (
                    <TableCell>
                      <Button variant="contained" size="small" onClick={() => handleSave(e.id)}>💾 Save</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">No expenses recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack alignItems="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Stack>
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
