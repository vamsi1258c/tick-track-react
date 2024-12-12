import React, { useState, useEffect } from 'react';
import {
  Container,
  Autocomplete,
  Card,
  Grid,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTicket, updateTicket } from '../../services/ticket';
import { fetchUsers } from '../../services/authService';
import { uploadAttachment } from '../../services/attachment';
import { fetchConfigMaster } from '../../services/configMaster';
import { fetchComments, createComment } from '../../services/comment';
import AttachmentsView from './AttachmentsView';
import RichTextEditor from './RichTextEditor';
import { useSnackbar } from '../Snackbar';

const TicketEdit = ({ currentUserId }) => {
  const location = useLocation();
  const ticketId = location.state?.ticketId;
  const [validationErrors, setValidationErrors] = useState({});

  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: 'service',
    subcategory: 'customer_service',
    created_by: 0,
    assigned_to: 0,
    approved_by: 0,
  });

  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();
  const [assignedToUser, setAssignedToUser] = useState(null);
  const [approvedByUser, setApprovedByUser] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [resetTrigger, setResetTrigger] = useState(false);
  const [configs, setConfigs] = useState([]);
  // const [currentSubcat, setCurrentSubcat] = useState([]);

  // New state variables for comments
  // const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [userResponse, ticketResponse] = await Promise.all([
          fetchUsers(),
          fetchTicket(ticketId),
          fetchComments(ticketId),
          fetchConfigMaster(),
        ]);

        const userOptions = userResponse.data.map((user) => ({
          value: user.id,
          label: user.username,
        }));
        setUsers(userOptions);

        let ticketDataTemp = {
          ...ticketResponse.data,
          assigned_to: ticketResponse.data.assignee
            ? ticketResponse.data.assignee.id
            : null,
          approved_by: ticketResponse.data.approver
            ? ticketResponse.data.approver.id
            : null,
        };

        setTicketData(ticketDataTemp);

        const responseConfig = await fetchConfigMaster();
        setConfigs(responseConfig.data);

        // Set subcategories based on the current category of the ticket
        // const initialCategory = ticketResponse.data.category || 'service';
        // setSubcategories(getSubcategories(initialCategory));

        const assignee = ticketResponse.data.assignee?.username;
        const assigneeOption = userOptions.find(
          (user) => user.label === assignee
        );
        setAssignedToUser(assigneeOption || null);
        const approver = ticketResponse.data.approver?.username;
        const approverOption = userOptions.find(
          (user) => user.label === approver
        );
        setApprovedByUser(approverOption || null);
        // setComments(commentsResponse.data);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch ticket, users, or comments.');
        showSnackbar('Failed to fetch ticket, users, or comments.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [currentUserId, ticketId, resetTrigger, showSnackbar]);

  // Handle category change to update subcategories
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setTicketData((prevData) => ({
      ...prevData,
      category: selectedCategory,
    }));
  };

  // Function to get subcategories based on selected category
  // const getSubcategories = (category) => {
  //     return configs
  //         .filter(config => config.parent === category)
  //         .map((config) => ({ label: config.label, value: config.value || config.id }));
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value,
    });
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: 'This field is required.',
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const stripHtmlTags = (input) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = input;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const validateDescription = () => {
    if (stripHtmlTags(ticketData.description).trim() === '') {
      setValidationErrors((prev) => ({
        ...prev,
        description: 'This field is required.',
      }));
    }
  };

  const handleBlur = (e) => {
    if (e === 'description') {
      validateDescription();
      return;
    }
    validateField(e.target.name, e.target.value);
  };

  const handleDescriptionChange = (content) => {
    setTicketData({ ...ticketData, description: content });
    setValidationErrors((prev) => ({ ...prev, description: '' }));
  };

  const handleAssignedToChange = (selectedOption) => {
    setAssignedToUser(selectedOption);
    setTicketData((prevData) => ({
      ...prevData,
      assigned_to: selectedOption ? selectedOption.value : 0,
    }));
  };

  const handleApprovedByChange = (selectedOption) => {
    setApprovedByUser(selectedOption);
    setTicketData((prevData) => ({
      ...prevData,
      approved_by: selectedOption ? selectedOption.value : 0,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prevAttachments) => [...prevAttachments, ...files]);
  };

  const handleReset = () => {
    setResetTrigger((prev) => !prev);
  };

  const removeFile = (index) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const fieldsToValidate = [
      'title',
      'description',
      'status',
      'priority',
      'category',
    ];

    fieldsToValidate.forEach((field) => {
      const value =
        field === 'description'
          ? stripHtmlTags(ticketData[field])
          : ticketData[field];

      if (!value || value.trim() === '') {
        errors[field] = 'This field is required.';
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const updateData = {
      title: ticketData.title,
      description: ticketData.description,
      status: ticketData.status,
      priority: ticketData.priority,
      category: ticketData.category,
      assigned_to: ticketData.assigned_to,
      subcategory: ticketData.subcategory,
      approved_by: ticketData.approved_by,
    };
    try {
      // First, update the ticket
      const response = await updateTicket(ticketId, updateData);
      if (response.status === 200) {
        // If attachments are present, upload them
        if (attachments.length > 0) {
          await Promise.all(
            attachments.map(async (attachment) => {
              await uploadAttachment(ticketId, attachment);
            })
          );
        }

        if (newComment.trim()) {
          await createComment(ticketId, {
            content: newComment,
            ticket_id: ticketId,
            user_id: currentUserId,
          });
        }

        setSuccess(true);
        navigate('/tickets');
        showSnackbar('Updated ticket #' + ticketId);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to update the ticket. Please try again.');
      showSnackbar('Failed to update ticket #' + ticketId, 'error');
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const priorityOptions = configs
    .filter((config) => config.type === 'priority')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id,
    }));

  const statusOptions = configs
    .filter((config) => config.type === 'status')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id,
    }));

  const categoryOptions = configs
    .filter((config) => config.type === 'category')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id,
    }));

  const subcategoryOptions = configs
    .filter(
      (config) =>
        config.type === 'subcategory' && config.parent === ticketData.category
    )
    .map((config) => ({
      label: config.label,
      value: config.value || config.id,
    }));

  return (
    <Container maxWidth="md">
      <Card variant="contained" sx={{ mt: 0, p: 1, pt: 0, borderRadius: 1 }}>
        <CardHeader
          title={
            <>
              Update Ticket{' '}
              <span style={{ fontSize: '0.8em' }}>#{ticketData.id}</span>
            </>
          }
          titleTypographyProps={{
            align: 'center',
            variant: 'h5',
            fontWeight: 'bold',
            color: 'primary.main',
          }}
          sx={{ p: 0.2, bgcolor: '#f5f5f5' }}
        />
        <CardContent sx={{ p: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Ticket updated successfully!</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={1}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  name="title"
                  value={ticketData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter ticket title"
                  fullWidth
                  size="small"
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontWeight: 500,
                    },
                    mb: 0.5,
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <RichTextEditor
                  value={ticketData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Description"
                />
                {touchedFields.description && validationErrors.description && (
                  <Typography color="error">
                    {validationErrors.description}
                  </Typography>
                )}
              </Grid>

              {/* Dropdowns */}
              <Grid item xs={12}>
                <Grid
                  container
                  spacing={1}
                  mb={2}
                  wrap="wrap"
                  alignItems="center"
                >
                  {/* Status */}
                  <Grid item xs={6} sm={3}>
                    <Autocomplete
                      value={statusOptions.find(
                        (option) => option.value === ticketData.status
                      )}
                      onChange={(event, newValue) =>
                        handleChange({
                          target: { name: 'status', value: newValue?.value },
                        })
                      }
                      options={statusOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Status" size="small" />
                      )}
                    />
                  </Grid>

                  {/* Priority */}
                  <Grid item xs={6} sm={3}>
                    <Autocomplete
                      value={priorityOptions.find(
                        (option) => option.value === ticketData.priority
                      )}
                      onChange={(event, newValue) =>
                        handleChange({
                          target: { name: 'priority', value: newValue?.value },
                        })
                      }
                      options={priorityOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Priority" size="small" />
                      )}
                    />
                  </Grid>

                  {/* Category */}
                  <Grid item xs={6} sm={3}>
                    <Autocomplete
                      value={categoryOptions.find(
                        (option) => option.value === ticketData.category
                      )}
                      onChange={(event, newValue) =>
                        handleCategoryChange({
                          target: { name: 'category', value: newValue?.value },
                        })
                      }
                      options={categoryOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Category" size="small" />
                      )}
                    />
                  </Grid>

                  {/* Subcategory */}
                  <Grid item xs={6} sm={3}>
                    <Autocomplete
                      value={subcategoryOptions.find(
                        (option) => option.value === ticketData.subcategory
                      )}
                      onChange={(event, newValue) =>
                        handleChange({
                          target: {
                            name: 'subcategory',
                            value: newValue?.value,
                          },
                        })
                      }
                      options={subcategoryOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Subcategory"
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Assignee and Approver */}
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option.label || ''}
                      onChange={(_, newValue) =>
                        handleAssignedToChange(newValue)
                      }
                      value={assignedToUser}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assignee"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option.label || ''}
                      onChange={(_, newValue) =>
                        handleApprovedByChange(newValue)
                      }
                      value={approvedByUser}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Approver"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Comments and Attachments */}
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="flex-start">
                  {/* Comments */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Add a comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  {/* Attachments */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Button variant="outlined" component="label" size="small">
                        <UploadIcon fontSize="small" />
                        Attach
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => setShowAttachments(true)}
                        size="small"
                      >
                        View Uploaded
                      </Button>

                      {/* Display Attachments */}
                      {attachments.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
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
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '0.7rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '100px',
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
                </Grid>
              </Grid>

              {/* Buttons Section */}
              <Grid item xs={12} sx={{ mt: 1 }} container spacing={1}>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    color="primary"
                  >
                    Save
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" size="small" onClick={handleReset}>
                    Reset
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>

          {/* Attachments View Modal */}
          <AttachmentsView
            ticketId={ticketId}
            show={showAttachments}
            handleClose={() => setShowAttachments(false)}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default TicketEdit;
