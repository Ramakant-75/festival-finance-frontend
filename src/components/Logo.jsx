// src/components/Logo.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SanskritS = ({ size = 40 }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 200 200"
    whileHover={{ rotate: 10, scale: 1.1 }}
    transition={{ type: 'spring', stiffness: 200 }}
    style={{ cursor: 'pointer' }}
  >
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffafbd" />
        <stop offset="100%" stopColor="#ffc3a0" />
      </linearGradient>
    </defs>
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="120"
      fontFamily="'Noto Sans Devanagari', sans-serif"
      fill="url(#grad)"
    >
      स
    </text>
  </motion.svg>
);

export default SanskritS;
