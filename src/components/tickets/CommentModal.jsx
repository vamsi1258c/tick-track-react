import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box
} from '@mui/material'
import { useSelector } from 'react-redux'
import { DoubleArrow as DoubleArrowIcon } from '@mui/icons-material'
import { createComment } from '../../services/comment'
import { useSnackbar } from '../Snackbar'

const CommentModal = ({
  show,
  onClose,
  onSubmit,
  approvers,
  loading,
  ticketId,
  status,
  newStatus
}) => {
  const userId = useSelector((state) => state.app.userId)
  const [selectedApprover, setSelectedApprover] = useState(null)
  const [comment, setComment] = useState('')

  const { showSnackbar } = useSnackbar()

  const handleApproverChange = (e) => {
    setSelectedApprover(e.target.value)
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value)
  }

  const handleSubmit = async () => {
    await onSubmit(selectedApprover)

    // Create the comment
    const newComment = comment.trim()

    if (newComment) {
      try {
        await createComment(ticketId, {
          content: newComment,
          ticket_id: ticketId,
          user_id: userId
        })
        setComment('')
      } catch (error) {
        showSnackbar('Failed to submit comment. Please try again.')
        console.error('Error submitting comment:', error)
      }
    }
  }

  function toTitleCase(text) {
    return text
      ?.split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <Modal show={show} onHide={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" my={3}>
          <Typography variant="h6">{toTitleCase(status)}</Typography>
          <DoubleArrowIcon sx={{ mx: 2 }} />
          <Typography variant="h6" color="white">
            {toTitleCase(newStatus)}
          </Typography>
        </Box>{' '}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100px'
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {' '}
            {newStatus === 'to_be_approved' && (
              <FormControl fullWidth variant="outlined" sx={{ my: 2 }}>
                <InputLabel id="approver-select-label">
                  Select an approver
                </InputLabel>
                <Select
                  labelId="approver-select-label"
                  value={selectedApprover || ''}
                  onChange={handleApproverChange}
                  label="Select an approver"
                >
                  <MenuItem value="" disabled>
                    Select Approver
                  </MenuItem>
                  {approvers.map((approver) => (
                    <MenuItem key={approver.id} value={approver.id}>
                      {approver.fullname} ({approver.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {/* Comment Box */}
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={3}
              variant="outlined"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Enter your comment"
              sx={{ mb: 2 }}
            />
          </>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!selectedApprover && !comment}
        >
          Confirm
        </Button>
      </DialogActions>
    </Modal>
  )
}

export default CommentModal
