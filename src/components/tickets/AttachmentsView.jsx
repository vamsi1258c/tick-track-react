import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Box
} from '@mui/material'
import {
  fetchAttachments,
  deleteAttachment,
  downloadAttachment
} from '../../services/attachment' // Import the download function
import {
  Delete as DeleteIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material'
import { useSnackbar } from '../Snackbar'

const AttachmentsView = ({ ticketId, show, handleClose }) => {
  const [attachments, setAttachments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    const loadAttachments = async () => {
      if (show) {
        try {
          setIsLoading(true)
          const response = await fetchAttachments(ticketId)
          setAttachments(response.data)
        } catch (err) {
          setError('Failed to fetch attachments.')
          showSnackbar('Failed to fetch attachments.')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadAttachments()
  }, [ticketId, show, showSnackbar])

  const handleDelete = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(ticketId, attachmentId)
        setAttachments(attachments.filter((att) => att.id !== attachmentId))
      } catch (err) {
        alert('Failed to delete attachment. Please try again.')
      }
    }
  }

  const handleDownload = async (attachmentId) => {
    try {
      await downloadAttachment(ticketId, attachmentId)
    } catch (err) {
      alert('Failed to download attachment. Please try again.')
      showSnackbar('Failed to download attachment. Please try again.')
    }
  }

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Attachments</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : attachments.length === 0 ? (
          <p>No attachments found for this ticket.</p>
        ) : (
          <List>
            {attachments.map((attachment) => (
              <ListItem
                key={attachment.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <DeleteIcon style={{ color: 'red' }} />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box
                      display="flex"
                      alignItems="center"
                      onClick={() => handleDownload(attachment.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <DownloadIcon sx={{ marginRight: 1 }} />
                      {attachment.filename}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ fontSize: 'small', color: 'text.secondary' }}>
                      Uploaded:{' '}
                      {new Date(attachment.uploaded_at).toLocaleString()}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <button className="btn btn-secondary" onClick={handleClose}>
          Close
        </button>
      </DialogActions>
    </Dialog>
  )
}

export default AttachmentsView
