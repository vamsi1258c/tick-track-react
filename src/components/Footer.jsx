import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#fffffc',
        padding: '16px 0',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2024 TickTrack - All Rights Reserved
      </Typography>
    </Box>
  );
};

export default Footer;
