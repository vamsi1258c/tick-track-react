import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const SessionExpired = () => {
  const navigate = useNavigate()

  const handleRedirect = () => {
    navigate('/signin')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: 3
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          position: 'absolute',
          top: '2rem',
          fontWeight: 'bold'
        }}
      >
        TickTrack
      </Typography>

      <Typography variant="h5" gutterBottom>
        Session Expired
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Your session has expired. Please log in again to continue.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleRedirect}
        sx={{ mt: 2 }}
      >
        Go to Login
      </Button>
    </Box>
  )
}

export default SessionExpired
