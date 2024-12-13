import React from 'react'
import Chip from '@mui/material/Chip'

// Define the shared styles
export const chipStyles = {
  padding: '1px 4px',
  fontSize: '0.7rem',
  height: '20px',
  fontWeight: 550,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
}

// Function to render Category Badge
export const renderCategoryBadge = (category) => {
  switch (category) {
    case 'service':
      return (
        <Chip
          label="Service"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f8f9fa', color: '#3D9970' }}
        />
      )
    case 'troubleshooting':
      return (
        <Chip
          label="Troubleshooting"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#fff', color: '#FF6347' }}
        />
      )
    case 'maintenance':
      return (
        <Chip
          label="Maintenance"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f8f9fa', color: '#DAA520' }}
        />
      )
    default:
      return (
        <Chip
          label="N/A"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f5f5f5', color: '#6A5ACD' }}
        />
      )
  }
}

// Function to render Status Badge
export const renderStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return <Chip label="Open" color="info" size="small" sx={chipStyles} />
    case 'in_progress':
      return (
        <Chip
          label="In Progress"
          color="primary"
          size="small"
          sx={chipStyles}
        />
      )
    case 'closed':
      return (
        <Chip label="Closed" color="secondary" size="small" sx={chipStyles} />
      )
    case 'resolved':
      return (
        <Chip label="Resolved" color="success" size="small" sx={chipStyles} />
      )
    case 'to_be_approved':
      return (
        <Chip
          label="To Be Approved"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f5f5f5', color: '#6A5ACD' }}
        />
      )
    default:
      return (
        <Chip
          label={status}
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f5f5f5', color: '#6A5ACD' }}
        />
      )
  }
}

// Function to render Priority Badge
export const renderPriorityBadge = (priority) => {
  switch (priority) {
    case 'high':
      return <Chip label="High" color="warning" size="small" sx={chipStyles} />
    case 'medium':
      return (
        <Chip
          label="Medium"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f8f9fa', color: '#001f3f' }}
        />
      )
    case 'low':
      return (
        <Chip
          label="Low"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#fff', color: '#3D9970' }}
        />
      )
    case 'urgent':
      return <Chip label="Urgent" color="error" size="small" sx={chipStyles} />
    default:
      return (
        <Chip
          label="N/A"
          size="small"
          sx={{ ...chipStyles, backgroundColor: '#f5f5f5', color: '#6A5ACD' }}
        />
      )
  }
}
