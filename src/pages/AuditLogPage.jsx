import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination, Grid
} from '@mui/material';
import MainLayout from '../layout/MainLayout';
import PageHeader from '../components/PageHeader';
import api from '../api/axios';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

const AuditLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    entityType: '',
    year: currentYear
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    const params = {
      page,
      size,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, val]) => val !== '')
      ),
    };

    try {
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.content);
      setTotal(res.data.totalElements);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, page, size]);

  const handleExport = async () => {
    try {
      const res = await api.get('/audit-logs/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'audit-logs.xlsx');
    } catch (err) {
      alert("Export failed.");
    }
  };
  

  const handleResetFilters = () => {
    setFilters({ username: '', action: '', entityType: '', year: currentYear });
    setPage(0);
  };

  return (
    <MainLayout title="Audit Log History">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto', mt: 4 }}>
        <PageHeader />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">🔐 Audit Log Records</Typography>
        </Box>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={3}>
            <TextField
              size="small"
              fullWidth
              label="Username"
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                label="Action"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ADD_DONATION">ADD_DONATION</MenuItem>
                <MenuItem value="EDIT_DONATION">EDIT_DONATION</MenuItem>
                <MenuItem value="ADD_EXPENSE">ADD_EXPENSE</MenuItem>
                <MenuItem value="EDIT_EXPENSE">EDIT_EXPENSE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              size="small"
              fullWidth
              label="Entity Type"
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                label="Year"
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={1} display="flex" alignItems="center">
            <Button variant="outlined" fullWidth onClick={handleResetFilters}>🔄</Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No logs found for selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={size}
            onRowsPerPageChange={(e) => {
              setSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
          <Button variant="contained" onClick={handleExport}>
            📄 Export Logs
          </Button>
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default AuditLogPage;
