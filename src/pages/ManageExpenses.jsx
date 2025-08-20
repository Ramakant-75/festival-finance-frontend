import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Button, Snackbar, Alert, Typography, Box,
  FormControl, InputLabel, Select, Pagination, Stack, CircularProgress, Chip, Tooltip, IconButton,
  List, ListItem, ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Download as DownloadIcon, Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import api from '../api/axios';
import MainLayout from '../layout/MainLayout';
import PageHeader from '../components/PageHeader';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
const categories = ["Murti", "Banjo", "Mandap", "Pooja Samagri","Pavti Book", "Decoration", "Food", "Sound", "Lighting", "Misc"];
const pageSizeOptions = [10, 20, 50];

const ManageExpenses = () => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [edited, setEdited] = useState({});
  const [adjustments, setAdjustments] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [updatedRowId, setUpdatedRowId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [newPayments, setNewPayments] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
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

  const [editRowId, setEditRowId] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({});

  useEffect(() => {
    fetchExpenses();
    fetchTotal();
    fetchTotalPaid();
  }, [year, categoryFilter, addedByFilter, page, pageSize]);

  const fetchExpenses = async () => {
    try {
      const params = { year, category: categoryFilter || undefined, addedBy: addedByFilter || undefined, page: page - 1, size: pageSize };
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      alert("Error fetching expenses.");
    }
  };

  const fetchTotal = async () => {
    try {
      const params = { year, category: categoryFilter || undefined, addedBy: addedByFilter || undefined };
      const res = await api.get('/expenses/total', { params });
      setTotal(res.data);
    } catch {}
  };

  const fetchTotalPaid = async () => {
    try {
      const params = { year, category: categoryFilter || undefined, addedBy: addedByFilter || undefined };
      const res = await api.get('/expenses/total-paid', { params });
      setTotalPaidSum(res.data);
    } catch {}
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

    if (field === 'amount') {
      const expense = expenses.find(e => e.id === id);
      if (Number(value) > Number(expense?.balanceAmount)) {
        setPaymentErrors(prev => ({
          ...prev,
          [id]: '❌ Payment cannot exceed balance amount'
        }));
      } else {
        setPaymentErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    }
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
      setPaymentErrors(prev => ({ ...prev, [expenseId]: '' }));
    } catch {
      alert("Failed to add payment.");
    }
  };

  // UPDATED: use multipart/form-data so you can add multiple attachments while editing
  const handleSave = async (id) => {
    const original = expenses.find(e => e.id === id);
    const updated = {
      ...original,
      ...edited[id],
      amount: parseFloat(original.amount) + parseFloat(adjustments[id] || 0)
    };
  
    try {
      const formData = new FormData();
  
      // Send all updated fields as JSON blob (so backend can still bind to ExpenseUpdateRequest)
      formData.append(
        "data",
        new Blob([JSON.stringify(updated)], { type: "application/json" })
      );
  
      // Attach any newly selected files (multiple)
      if (uploadFiles[id]?.length > 0) {
        uploadFiles[id].forEach(file => formData.append("receipts", file));
      }
  
      await api.put(`/expenses/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
  
      setSuccess(true);
      setSuccessMessage("Expense updated successfully.");
      setUpdatedRowId(id);
      fetchExpenses();
      fetchTotal();
      fetchTotalPaid();
      setEdited(prev => { const ns = { ...prev }; delete ns[id]; return ns; });
      setAdjustments(prev => { const ns = { ...prev }; delete ns[id]; return ns; });
      setUploadFiles(prev => { const ns = { ...prev }; delete ns[id]; return ns; });
      setEditRowId(null);
      setTimeout(() => setUpdatedRowId(null), 3000);
    } catch {
      alert("Failed to update expense.");
    }
  };  

  const handleDeleteReceipt = async (expenseId, receiptId) => {
    try {
      await api.delete(`/expenses/${expenseId}/receipts/${receiptId}`);
      setSuccess(true);
      setSuccessMessage("Receipt deleted successfully.");
      fetchExpenses();
    } catch {
      alert("Failed to delete receipt.");
    }
  };

  const handleDownload = async (expenseId, receiptId, filename) => {
    try {
      const response = await api.get(`/expenses/${expenseId}/receipts/${receiptId}`, { responseType: 'blob' });
      saveAs(new Blob([response.data]), filename || `receipt-${receiptId}.jpg`);
    } catch {
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

  const handleFileChange = (id, event) => {
    const files = Array.from(event.target.files);
    setUploadFiles(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), ...files]
    }));
  };  

  return (
    <MainLayout title="Manage Expenses">
      <PageHeader />
      <Box display="flex" justifyContent="flex-end" mb={2} gap={1}>
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

      <Box sx={{ px: 4, py: 3 }}>
        {/* Filters */}
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={3}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} onChange={e => { setYear(e.target.value); setPage(1); }}>
              {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField size="small" label="Added By" value={addedByFilter} onChange={e => { setAddedByFilter(e.target.value); setPage(1); }} />
          <Button size="small" onClick={() => { setCategoryFilter(''); setAddedByFilter(''); setPage(1); }}>Reset Filters</Button>

          <Typography variant="h6" color="green" sx={{ ml: 'auto' }}>🧾 Total Expense: ₹ {total.toFixed(2)}</Typography>
          <Typography variant="h6" color="blue">💸 Paid: ₹ {totalPaidSum.toFixed(2)}</Typography>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Rows / page</InputLabel>
            <Select value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }}>
              {pageSizeOptions.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Paid / Balance</TableCell>
                <TableCell>Total (₹)</TableCell>
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
                          {editRowId === e.id ? (
                            <TextField
                              size="small"
                              type="text" // keep as text to allow "-" while typing
                              value={adjustments[e.id] || ''}
                              onChange={(ev) => {
                                const val = ev.target.value;
                                // allow empty, negative, decimals
                                if (/^-?\d*\.?\d*$/.test(val)) {
                                  handleAdjustmentChange(e.id, val);
                                }
                              }}
                              InputProps={{
                                inputProps: { step: "0.01" } // optional: allow decimal steps
                              }}
                            />
                          ) : (
                            <Typography>{adjustments[e.id] || '—'}</Typography>
                          )}
                        </TableCell>
                    <TableCell>{new Date(e.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      {editRowId === e.id ? (
                        <TextField size="small" value={edited[e.id]?.description ?? e.description} onChange={ev => setEdited(prev => ({ ...prev, [e.id]: { ...prev[e.id], description: ev.target.value } }))} />
                      ) : (
                        e.description
                      )}
                    </TableCell>
                    <TableCell>
                      {editRowId === e.id ? (
                        <TextField size="small" value={edited[e.id]?.addedBy ?? e.addedBy} onChange={ev => setEdited(prev => ({ ...prev, [e.id]: { ...prev[e.id], addedBy: ev.target.value } }))} />
                      ) : (
                        e.addedBy
                      )}
                    </TableCell>
                      <TableCell>
                        {editRowId === e.id ? (
                          <>
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                            >
                              📎 Upload
                              <input
                                type="file"
                                hidden
                                accept=".jpg,.jpeg,.png,.webp"
                                multiple
                                onChange={(ev) => handleFileChange(e.id, ev)}
                              />
                            </Button>

                            {uploadFiles[e.id]?.length > 0 && (
                              <List dense>
                                {uploadFiles[e.id].map((file, idx) => (
                                  <ListItem
                                    key={idx}
                                    secondaryAction={
                                      <IconButton
                                        edge="end"
                                        color="error"
                                        onClick={() => {
                                          setUploadFiles(prev => ({
                                            ...prev,
                                            [e.id]: prev[e.id].filter((_, i) => i !== idx)
                                          }));
                                        }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    }
                                  >
                                    <ListItemText primary={file.name} />
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </>
                        ) : (
                          e.hasReceipt ? (
                            <List dense>
                              {e.receipts?.map(r => (
                                <ListItem
                                  key={r.id}
                                  secondaryAction={
                                    <IconButton
                                      edge="end"
                                      color="error"
                                      onClick={() => handleDeleteReceipt(e.id, r.id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  }
                                >
                                  <ListItemText primary={r.fileName} />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography>No Receipt</Typography>
                          )
                        )}
                      </TableCell>
                    <TableCell>
                      {editRowId === e.id ? (
                        <Box display="flex" gap={1}>
                          <IconButton color="success" onClick={() => handleSave(e.id)}><SaveIcon /></IconButton>
                          <IconButton color="error" onClick={() => setEditRowId(null)}><CancelIcon /></IconButton>
                        </Box>
                      ) : (
                        <Box display="flex" gap={1}>
                          <Button variant="contained" size="small" onClick={() => handleSave(e.id)}>💾 Save</Button>
                          <Button variant="outlined" size="small" onClick={() => setExpandedRow(prev => prev === e.id ? null : e.id)}>
                            {expandedRow === e.id ? 'Hide Payments' : 'Payments 💳'}
                          </Button>
                          <IconButton color="primary" onClick={() => setEditRowId(e.id)}><EditIcon /></IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>

                  {expandedRow === e.id && (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: theme.palette.divider, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                          <Typography variant="subtitle1" gutterBottom>💳 Payments</Typography>
                          {e.payments?.length > 0 ? (
                            <Box mb={2}>
                              {e.payments.map((p, i) => (
                                <Typography key={p.id} variant="body2">
                                  #{i + 1}: ₹{p.amount} on {new Date(p.paymentDate).toLocaleDateString('en-IN')} by {p.paidBy || 'Unknown'} {p.paymentMethod && `via ${p.paymentMethod}`} {p.note && `– ${p.note}`}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" mb={2}>No payments recorded yet.</Typography>
                          )}
                          <Box display="flex" gap={2} flexWrap="wrap">
                            <TextField label="Amount" type="number" size="small" value={newPayments[e.id]?.amount ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'amount', ev.target.value)} error={!!paymentErrors[e.id]} helperText={paymentErrors[e.id]} />
                            <TextField label="Payment Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={newPayments[e.id]?.paymentDate ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'paymentDate', ev.target.value)} />
                            <TextField label="Paid By" size="small" value={newPayments[e.id]?.paidBy ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'paidBy', ev.target.value)} />
                            <TextField label="Mode" size="small" value={newPayments[e.id]?.paymentMethod ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'paymentMethod', ev.target.value)} />
                            <TextField label="Note" size="small" value={newPayments[e.id]?.note ?? ''} onChange={(ev) => handlePaymentChange(e.id, 'note', ev.target.value)} />
                            <Button variant="contained" size="small" onClick={() => handleAddPayment(e.id)} disabled={!!paymentErrors[e.id]}>➕ Add Payment</Button>                         
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
