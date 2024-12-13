import React, { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Grid,
  IconButton,
  TextField,
  Button,
  Alert,
  Card,
  CardHeader,
  Typography,
  CardContent,
  useMediaQuery,
  Box
} from '@mui/material'
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../../services/ticket'
import { uploadAttachment } from '../../services/attachment'
import { fetchConfigMaster } from '../../services/configMaster'
import { fetchUsers } from '../../services/authService'
import RichTextEditor from './RichTextEditor'
import { Autocomplete } from '@mui/material'
import { useSnackbar } from '../Snackbar'

const TicketCreate = ({ currentUser }) => {
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: '',
    category: '',
    subcategory: '',
    created_by: null,
    assigned_to: 1
  })

  const [attachments, setAttachments] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [subcategories, setSubcategories] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [configs, setConfigs] = useState([])

  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  const getSubcategories = useCallback(
    (category) => {
      if (!category) return []
      return configs
        .filter((config) => config.parent === category)
        .map((config) => ({
          label: config.label,
          value: config.value ?? config.id
        }))
    },
    [configs]
  )

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetchUsers()
        setUsers(
          response.data.map((user) => ({ id: user.id, label: user.username }))
        )
        const currentUserId = response.data.find(
          (user) => user.username === currentUser
        )?.id
        setTicketData((prevData) => ({
          ...prevData,
          created_by: currentUserId
        }))
      } catch (error) {
        setError('Failed to fetch users.')
        showSnackbar('Failed to fetch users.')
      }
    }

    const fetchAllConfigs = async () => {
      const responseConfig = await fetchConfigMaster()
      setConfigs(responseConfig.data)
    }

    fetchAllUsers()
    fetchAllConfigs()
  }, [currentUser, showSnackbar])

  useEffect(() => {
    setSubcategories(getSubcategories(ticketData.category))
  }, [getSubcategories, ticketData.category])

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value
    setTicketData((prevData) => ({
      ...prevData,
      category: selectedCategory,
      subcategory: ''
    }))
    setSubcategories(getSubcategories(selectedCategory))
    setTouchedFields((prev) => ({ ...prev, category: true }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTicketData({
      ...ticketData,
      [name]: value
    })
    setTouchedFields((prev) => ({ ...prev, [name]: true }))
  }

  const handleDescriptionChange = (content) => {
    setTicketData({ ...ticketData, description: content })
    setTouchedFields((prev) => ({ ...prev, description: true }))
  }

  const handleAssignedToChange = (event, newValue) => {
    setTicketData({
      ...ticketData,
      assigned_to: newValue ? newValue.id : 0
    })
    setTouchedFields((prev) => ({ ...prev, assigned_to: true }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments((prevAttachments) => [...prevAttachments, ...files])
  }

  const removeFile = (index) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    )
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateFields = useCallback(() => {
    const errors = {}
    if (!ticketData.title.trim()) errors.title = 'Title is required'
    if (!ticketData.description.trim())
      errors.description = 'Description is required'
    if (!ticketData.priority) errors.priority = 'Priority is required'
    if (!ticketData.category) errors.category = 'Category is required'
    if (!ticketData.subcategory) errors.subcategory = 'Subcategory is required'

    setValidationErrors(errors)

    // Return true if no errors are found, false otherwise
    return Object.keys(errors).length === 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = validateFields()
    if (!isValid) return

    try {
      const response = await createTicket(ticketData)
      if (response.status === 201) {
        const ticketId = response.data.id
        setSuccess(true)

        await Promise.all(
          attachments.map(async (attachment) => {
            await uploadAttachment(ticketId, attachment)
          })
        )
        showSnackbar('Submitted Ticket #' + ticketId)
        navigate('/tickets')
      }
    } catch (error) {
      setError('Failed to create the ticket. Please try again.')
      showSnackbar('Failed to create the ticket. Please try again.', 'error')
    }
  }

  useEffect(() => {
    const isValid = validateFields()
    setIsFormValid(isValid)
  }, [ticketData, validationErrors, validateFields])

  const clearForm = () => {
    setTicketData({
      title: '',
      description: '',
      status: 'open',
      priority: '',
      category: '',
      subcategory: '',
      created_by: null,
      assigned_to: 1
    })
    setAttachments([])
    setTouchedFields({})
    setValidationErrors({})
  }

  const priorityOptions = configs
    .filter((config) => config.type === 'priority')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id
    }))

  const categoryOptions = configs
    .filter((config) => config.type === 'category')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id
    }))

  return (
    <Container maxWidth="md">
      <Card variant="contained" sx={{ mt: 0, p: '3px 4px', borderRadius: 1 }}>
        <CardHeader
          title="Create Ticket"
          titleTypographyProps={{
            align: 'center',
            variant: 'h5',
            fontWeight: 'bold',
            color: 'primary.main'
          }}
          sx={{ p: 0.3, bgcolor: '#f5f5f5', textAlign: 'center' }}
        />
        <CardContent sx={{ p: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 1 }}>
              Ticket created successfully!
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={1} alignItems="center">
              {/* Title Field */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={ticketData.title}
                  onChange={handleChange}
                  error={touchedFields.title && !!validationErrors.title}
                  helperText={touchedFields.title && validationErrors.title}
                  required
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              {/* Description with reduced margin */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <RichTextEditor
                  value={ticketData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Description"
                />
                {touchedFields.description && validationErrors.description && (
                  <Typography
                    color="error"
                    sx={{ mt: 0.5, fontSize: '0.75rem' }}
                  >
                    {validationErrors.description}
                  </Typography>
                )}
              </Grid>

              {/* Drop-down Controls */}
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  direction={
                    useMediaQuery('(max-width:600px)') ? 'column' : 'row'
                  }
                  wrap="nowrap"
                  sx={{ gap: 0.5 }}
                >
                  {/* Category */}
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      value={
                        categoryOptions.find(
                          (option) => option.value === ticketData.category
                        ) || null
                      }
                      onChange={(event, newValue) =>
                        handleCategoryChange({
                          target: { name: 'category', value: newValue?.value }
                        })
                      }
                      options={categoryOptions}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          variant="outlined"
                          size="small"
                          margin="dense"
                        />
                      )}
                      sx={{
                        minWidth: 150,
                        '& .MuiInputBase-root': {
                          padding: '10px'
                        }
                      }}
                    />
                  </Grid>

                  {/* Subcategory */}
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      value={
                        subcategories.find(
                          (option) => option.value === ticketData.subcategory
                        ) || null
                      }
                      onChange={(event, newValue) =>
                        handleChange({
                          target: {
                            name: 'subcategory',
                            value: newValue?.value
                          }
                        })
                      }
                      options={subcategories}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Subcategory"
                          variant="outlined"
                          size="small"
                          margin="dense"
                        />
                      )}
                      sx={{
                        minWidth: 150,
                        '& .MuiInputBase-root': {
                          padding: '10px'
                        }
                      }}
                    />
                  </Grid>

                  {/* Priority */}
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      value={
                        priorityOptions.find(
                          (option) => option.value === ticketData.priority
                        ) || null
                      }
                      onChange={(event, newValue) =>
                        handleChange({
                          target: { name: 'priority', value: newValue?.value }
                        })
                      }
                      options={priorityOptions}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Priority"
                          variant="outlined"
                          size="small"
                          margin="dense"
                        />
                      )}
                      sx={{
                        minWidth: 150,
                        '& .MuiInputBase-root': {
                          padding: '10px'
                        }
                      }}
                    />
                  </Grid>

                  {/* Assignee */}
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option.label}
                      value={users.find(
                        (user) => user.id === ticketData.assigned_to
                      )}
                      onChange={handleAssignedToChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assignee"
                          variant="outlined"
                          size="small"
                          margin="dense"
                          sx={{ minWidth: 150 }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Attachments */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  {/* Attachment Button */}
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      borderRadius: 0.5
                    }}
                    size="small"
                  >
                    <UploadIcon sx={{ fontSize: 'small', mr: 0.5 }} />
                    Attach
                    <input
                      type="file"
                      multiple
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>

                  {/* Display Attachments */}
                  {attachments.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1
                      }}
                    >
                      {attachments.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: '#f9f9f9',
                            p: '1px 6px',
                            borderRadius: 1
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100px'
                            }}
                          >
                            {file.name}
                          </Typography>
                          <IconButton
                            onClick={() => removeFile(index)}
                            color="error"
                            size="small"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Buttons Section */}
              <Grid
                item
                xs={12}
                sx={{ mt: 1 }}
                container
                spacing={2}
                justifyContent="flex-start"
              >
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    color="primary"
                    sx={{ width: '80px' }}
                    disabled={!isFormValid}
                  >
                    Submit
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearForm}
                    sx={{ width: '80px' }}
                  >
                    Clear
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => navigate(-1)}
                    sx={{ width: '80px' }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}

export default TicketCreate
