import React from 'react';
import { Button } from '@mui/material';

const FloatingButton = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      sx={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
        },
        ...props.sx, // Allow overrides
      }}
    >
      {children}
    </Button>
  );
};

export default FloatingButton;
