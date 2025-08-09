import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Button, Snackbar, Alert, Typography, Box,
  FormControl, InputLabel, Select, Pagination, Stack, CircularProgress
} from '@mui/material';
import { saveAs } from 'file-saver';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import PageHeader from '../components/PageHeader';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
const categories = ["Murti", "Banjo", "Mandap", "Pooja Samagri", "Decoration", "Food", "Sound", "Lighting", "Misc"];
const pageSizeOptions = [10, 20, 50];

const ManageExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [edited, setEdited] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [updatedRowId, setUpdatedRowId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [newPayments, setNewPayments] = useState({});
  const [year, setYear] = useState(currentYear);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [addedByFilter, setAddedByFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPaidSum, setTotalPaidSum] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [exportingBasic, setExportingBasic] = useState(false);
  const [exportingDetailed, setExportingDetailed] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchTotal();
    fetchTotalPaid();
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

  const fetchTotalPaid = async () => {
    try {
      const params = {
        year,
        category: categoryFilter || undefined,
        addedBy: addedByFilter || undefined,
      };
      const res = await api.get('/expenses/total-paid', { params });
      setTotalPaidSum(res.data);
    } catch (err) {
      console.error("Error fetching total paid.");
    }
  };

  const handleAdjustmentChange = (id, value) => {
    setAdjustments(prev => ({ ...prev, [id]: value }));
  };

  const handlePaymentChange = (id, field, value) => {
    setNewPayments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const handleAddPayment = async (expenseId) => {
    const payment = newPayments[expenseId];
    if (!payment || !payment.amount || !payment.paymentDate) {
      alert("Please fill amount and date.");
      return;
    }
    try {
      await api.post(`/expenses/${expenseId}/payments`, payment);
      setSuccess(true);
      setSuccessMessage("Payment added successfully.");
      fetchExpenses();
      fetchTotalPaid();
      setNewPayments(prev => ({ ...prev, [expenseId]: {} }));
    } catch (err) {
      alert("Failed to add payment.");
    }
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
      setSuccessMessage("Expense updated successfully.");
      setUpdatedRowId(id);
      fetchExpenses();
      fetchTotal();
      fetchTotalPaid();
      setEdited(prev => { const newState = { ...prev }; delete newState[id]; return newState; });
      setAdjustments(prev => { const newState = { ...prev }; delete newState[id]; return newState; });
      setTimeout(() => setUpdatedRowId(null), 3000);
    } catch (err) {
      alert("Failed to update expense.");
    }
  };

  const handleDownload = async (expenseId, receiptId, filename) => {
    try {
      const response = await api.get(`/expenses/${expenseId}/receipts/${receiptId}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      saveAs(blob, filename || `receipt-${receiptId}.jpg`);
    } catch (err) {
      alert("Failed to download receipt.");
    }
  };

  const handleExport = async (type = 'basic') => {
    const isBasic = type === 'basic';
    const setLoading = isBasic ? setExportingBasic : setExportingDetailed;
    const endpoint = isBasic ? '/export/expenses' : '/export/export-detailed-expenses';
    const filename = isBasic ? 'expenses.xlsx' : 'detailed_expenses.xlsx';

    try {
      setLoading(true);
      const res = await api.get(endpoint, { responseType: 'blob' });
      saveAs(new Blob([res.data]), filename);
      setSuccess(true);
      setSuccessMessage(`${isBasic ? 'Simple' : 'Detailed'} report downloaded successfully`);
    } catch {
      alert(`Failed to download ${isBasic ? 'simple' : 'detailed'} report.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Manage Expenses">
      <PageHeader />
      <Box sx={{ px: 4, py: 3 }}>
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={3}>
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

          <Button size="small" onClick={() => { setCategoryFilter(''); setAddedByFilter(''); setPage(1); }}>
            Reset Filters
          </Button>

          <Typography variant="h6" color="green" sx={{ ml: 'auto' }}>
            🧾 Total Expenses: ₹ {total.toFixed(2)}
          </Typography>

          <Typography variant="h6" color="blue">
            💸 Paid: ₹ {totalPaidSum.toFixed(2)}
          </Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows / page</InputLabel>
            <Select value={pageSize} label="Rows / page" onChange={e => { setPageSize(e.target.value); setPage(1); }}>
              {pageSizeOptions.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('basic')}
            disabled={exportingBasic || exportingDetailed}
            startIcon={exportingBasic ? <CircularProgress size={18} /> : null}
          >
            📤 Export Excel
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="success"
            onClick={() => handleExport('detailed')}
            disabled={exportingBasic || exportingDetailed}
            startIcon={exportingDetailed ? <CircularProgress size={18} /> : null}
          >
            📥 Export Detailed Report
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Paid / Balance</TableCell>
                <TableCell>Total Amount (₹)</TableCell>
                <TableCell>Adjustment (±)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Receipts</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((e, idx) => (
                <React.Fragment key={e.id}>
                  <TableRow sx={{ backgroundColor: updatedRowId === e.id ? '#0fd69a' : 'inherit' }}>
                    <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell>{e.category}</TableCell>
                    <TableCell>₹ {e.totalPaid?.toFixed(2) || 0} / ₹ {e.balanceAmount?.toFixed(2) || 0}</TableCell>
                    <TableCell>₹ {e.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        placeholder="± Amount"
                        value={adjustments[e.id] || ''}
                        onChange={(evt) => handleAdjustmentChange(e.id, evt.target.value)}
                      />
                    </TableCell>
                    <TableCell>{new Date(e.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell>{e.addedBy}</TableCell>
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
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button variant="contained" size="small" onClick={() => handleSave(e.id)}>💾 Save</Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setExpandedRow(prev => prev === e.id ? null : e.id)}
                        >
                          {expandedRow === e.id ? 'Hide Payments' : 'Payments 💳'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {expandedRow === e.id && (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <Box sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#f9f9f9' }}>
                          <Typography variant="subtitle1" gutterBottom>💳 Payments</Typography>
                          {e.payments?.length > 0 ? (
                            <Box mb={2}>
                              {e.payments.map((p, i) => (
                                <Typography key={p.id} variant="body2">
                                  #{i + 1}: ₹{p.amount} paid on {new Date(p.paymentDate).toLocaleDateString('en-IN')} by {p.paidBy || 'Unknown'} {p.paymentMethod && `via ${p.paymentMethod}`} {p.note && `– ${p.note}`}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" mb={2}>No payments recorded yet.</Typography>
                          )}
                          <Box display="flex" gap={2} flexWrap="wrap">
                            <TextField label="Amount" type="number" size="small" value={newPayments[e.id]?.amount ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'amount', ev.target.value)} />
                            <TextField label="Payment Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={newPayments[e.id]?.paymentDate ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'paymentDate', ev.target.value)} />
                            <TextField label="Paid By" size="small" value={newPayments[e.id]?.paidBy ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'paidBy', ev.target.value)} />
                            <TextField label="Method" size="small" value={newPayments[e.id]?.paymentMethod ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'paymentMethod', ev.target.value)} />
                            <TextField label="Note" size="small" value={newPayments[e.id]?.note ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'note', ev.target.value)} />
                            <Button variant="contained" size="small" onClick={() => handleAddPayment(e.id)}>➕ Add Payment</Button>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">No expenses recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack alignItems="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Stack>
      </Box>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>{successMessage || '✅ Operation completed successfully!'}</Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default ManageExpenses;
