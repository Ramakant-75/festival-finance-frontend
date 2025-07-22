// src/components/PageHeader.jsx
import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const PageHeader = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
      <Tooltip title="Go Back">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Go Home">
        <IconButton onClick={() => navigate('/')}>
          <HomeIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default PageHeader;
