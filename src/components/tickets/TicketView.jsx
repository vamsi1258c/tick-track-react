import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Divider, IconButton, Button, CircularProgress, Stack, Tabs, Tab,
    TextField,  Grid, Card, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Autocomplete
} from '@mui/material';
import {
    Download as DownloadIcon, Person as PersonIcon, Label as SubcategoryIcon,
    AssignmentInd as AssignmentIndIcon, CheckCircle as CheckCircleIcon,
    CalendarToday as CalendarTodayIcon, Update as UpdateIcon,
    Category as CategoryIcon, Assignment as StatusIcon, PriorityHigh as PriorityIcon,
    Edit as EditIcon, Close as CloseIcon, Delete as DeleteIcon, Refresh as RefreshIcon, ArrowBack as ArrowBackIcon,
    Add as AddIcon
} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import CommentModal from './CommentModal';
import StatusDropdown from './StatusDropdown';
import { useSnackbar } from '../Snackbar';
import { updateTicket } from '../../services/ticket';
import { createComment } from '../../services/comment';
import { downloadAttachment } from '../../services/attachment';
import { fetchUsers } from '../../services/authService';
import { fetchTicket, deleteTicket } from '../../services/ticket';
import { renderCategoryBadge, renderStatusBadge, renderPriorityBadge, chipStyles } from '../../utils/renderBadges';
import './TicketDetail.css';


const TicketView = ({
    currentUser,
}) => {
    const location = useLocation();
    const ticketId = location.state?.ticketId;
    const [selectedTicket, setSelectedTicket] = useState({});
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [loadingApprovers, setLoadingApprovers] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [users, setUsers] = useState([]);
    const [updatedStatus, setUpdatedStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(0);
    const [assignedToUser, setAssignedToUser] = useState(null);
    const [userOptions, setUserOptions] = useState([]);

    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    

    useEffect(() => {
        const loadData = async () => {
            const responseUsers = await fetchUsers();
            setUsers(responseUsers.data);
            const userOptionsTemp = responseUsers.data.map(user => ({
                value: user.id,
                label: user.username,
            }));
            setUserOptions(userOptionsTemp);
            const responseTicket = await fetchTicket(ticketId)
            setSelectedTicket(responseTicket.data);
            const currentAssignee = { value: responseTicket.data.assignee.id, label: responseTicket.data.assignee.username };
            setAssignedToUser(currentAssignee);
            setLoading(false);
        }
        loadData();
    }, [ticketId, loading]);

    // const handleSendForApproval = () => {
    //     try {
    //         setLoadingApprovers(true);
    //         setShowCommentModal(true);
    //     } catch (error) {
    //         console.error('Failed to filter approvers', error);
    //     } finally {
    //         setLoadingApprovers(false);
    //     }
    // };

    const handleDownloadAttachment = async (ticketid, attachmentId) => {
        try {
            await downloadAttachment(ticketid, attachmentId);
        } catch (error) {
            console.error('Failed to download attachment', error);
            showSnackbar('Failed to download attachment', 'error');
        }
    };

    const handleCommentSubmit = async (approverId) => {
        try {
            await updateTicket(selectedTicket.id, {
                status: updatedStatus,
                ...(approverId && approverId !== 0 && { approved_by: approverId })
            });
            setShowCommentModal(false);
            showSnackbar('Ticket Status has been updated!');
        } catch (error) {
            showSnackbar('Failed to update the status. Please try again.', 'error');
        }
        setLoading(true);
    };

    const handleStatusUpdate = async (status, newStatus) => {
        setLoadingApprovers(true);
        setUpdatedStatus(newStatus);
        setShowCommentModal(true);
        try {
            setLoadingApprovers(true);
            setUpdatedStatus(newStatus);
            setShowCommentModal(true);
        } catch (error) {
            showSnackbar('Failed to update status. Please try again.', 'error');
        } finally {
            setLoadingApprovers(false);
        }
        setLoading(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            navigate(-1);
            showSnackbar('Deleted Ticket #' + id, 'success');
        } catch (error) {
            showSnackbar('Failed to delete Ticket!', 'error');
        }
        setShowDeleteModal(false);
    };

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                const response = await createComment(selectedTicket.id, {
                    content: newComment,
                    ticket_id: selectedTicket.id,
                    user_id: users.find(user => user.username === currentUser)?.id
                });
                selectedTicket.comments.push(response.data);
                setNewComment('');
            } catch (error) {
                showSnackbar('Failed to add comment. Please try again.', 'error');
            }
        }
    };

    const handleAssignedToChange = async (newValue) => {
        setAssignedToUser(newValue);
        if (newValue) {
            try {
                await updateTicket(selectedTicket.id, {
                    assigned_to: newValue.value,
                });
            } catch (error) {
                showSnackbar('Failed to update the assignee. Please try again.', 'error');
            }
        }
    };

    function toTitleCase(text) {
        return text?.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={48} />
            </div>
        );
    }

    return (
        <>
            <Card variant='contained' sx={{ p: 3, boxShadow: 1, borderRadius: 3, maxWidth: 1000, margin: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', mb: 1 }}>
                    <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
                        Review Ticket #{selectedTicket?.id}
                    </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0 }}>
                    <IconButton
                        variant="tonal"
                        size="small"
                        disableElevation
                        sx={{ mr: 1.5, px: 2, fontSize: '0.7rem', paddingTop: 0 }}
                        onClick={() => { navigate(-1) }}
                    ><ArrowBackIcon />
                    </IconButton>
                    <IconButton
                        variant="tonal"
                        size="small"
                        disableElevation
                        sx={{ mr: 1.5, px: 2, fontSize: '0.7rem', paddingTop: 0 }}
                        onClick={() => navigate('/edit-ticket', { state: { ticketId: selectedTicket.id } })}
                    ><EditIcon />
                    </IconButton>
                    {selectedTicket.creator?.username === currentUser && selectedTicket.status === 'closed' && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setTicketToDelete(selectedTicket);
                                setShowDeleteModal(true);
                            }}
                            className="action-icon"
                        >
                            <DeleteIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                    )}
                    <IconButton
                        variant="tonal"
                        size="small"
                        disableElevation
                        sx={{ mr: 1.5, px: 2, fontSize: '0.7rem', paddingTop: 0 }}
                        onClick={() => { setLoading(true) }}
                    ><RefreshIcon />
                    </IconButton>
                    <StatusDropdown
                        currentUser={currentUser}
                        selectedTicket={selectedTicket}
                        onUpdateStatus={handleStatusUpdate}
                    />
                </Box>
                <Divider sx={{ my: 0 }} />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 2 }}>
                        <strong>{selectedTicket?.title}</strong>
                    </Typography>
                    <Typography variant="body2" dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(selectedTicket?.description || '')
                    }} /> </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Ticket Details Section */}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                            {/* Ticket Metadata */}
                            <Stack spacing={2} sx={{ mt: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                    <StatusIcon sx={{ color: 'info.main', mr: 1 }} />
                                    <Typography variant="body2">
                                        <strong>Status:</strong> {renderStatusBadge(selectedTicket?.status)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                    <PriorityIcon sx={{ color: 'error.main', mr: 1 }} />
                                    <Typography variant="body2">
                                        <strong>Priority:</strong> {renderPriorityBadge(selectedTicket?.priority)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                    <CategoryIcon sx={{ color: 'secondary.main', mr: 1 }} />
                                    <Typography variant="body2">
                                        <strong>Category:</strong> {renderCategoryBadge(selectedTicket?.category)}
                                    </Typography>
                                </Box>

                                {selectedTicket?.subcategory && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                        <SubcategoryIcon sx={{ color: 'warning.main', mr: 1 }} />
                                        <Typography variant="body2">
                                            <strong>Subcategory:</strong> <Chip
                                                label={toTitleCase(selectedTicket.subcategory)}
                                                size="small"
                                                sx={{ ...chipStyles, backgroundColor: '#f8f9fa', color: '#3D9970' }}
                                            />
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid item xs={12} sm={6}>
                        {/* User Info Section */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AssignmentIndIcon color="secondary" sx={{ mr: 1 }} />
                                    <strong>Assignee:</strong>
                                    <Autocomplete
                                        options={userOptions}
                                        getOptionLabel={(option) => option?.label || ''}
                                        onChange={(_, newValue) => handleAssignedToChange(newValue)}
                                        value={assignedToUser}
                                        freeSolo
                                        disableClearable={false}
                                        clearOnBlur
                                        handleHomeEndKeys
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="standard"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    disableUnderline: true,
                                                }}
                                                sx={{
                                                    ml: 0.3,
                                                    width: 'auto',
                                                    minWidth: '150px'
                                                }}
                                            />
                                        )}
                                        sx={{
                                            ml: 0.3,
                                            width: 'auto',
                                            '& .MuiAutocomplete-input': {
                                                minWidth: '150px',
                                            },
                                        }}
                                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                                        filterSelectedOptions
                                    />
                                </Typography>
                            </Grid>

                            {selectedTicket?.approver && (
                                <Grid item xs={12}>
                                    <Typography variant="body2">
                                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                        <strong>Approver:</strong> {selectedTicket.approver.username}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="body2">
                                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                                    <strong>Creator:</strong> {selectedTicket?.creator?.username || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2">
                                    <CalendarTodayIcon color="action" sx={{ mr: 1 }} />
                                    <strong>Created:</strong> {new Date(selectedTicket?.created_at).toLocaleString() || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2">
                                    <UpdateIcon color="warning" sx={{ mr: 1 }} />
                                    <strong>Updated:</strong> {new Date(selectedTicket?.updated_at).toLocaleString() || 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>

                    </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                {/* Comments Section */}
                <Box sx={{ width: '100%' }}>
                    <Tabs value={value} onChange={handleTabChange} aria-label="ticket details tabs">
                        <Tab label="Comments" />
                        <Tab label="Attachments" />
                        <Tab label="Activity" />
                    </Tabs>

                    <Box sx={{ padding: 3 }}>
                        {value === 0 && (
                            <Box>
                                <Typography variant="h6">Comments:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
                                    <TextField
                                        value={newComment}
                                        onChange={handleCommentChange}
                                        size="small"
                                        fullWidth
                                        multiline
                                        maxRows={4}
                                        placeholder="Add a comment..."
                                        sx={{
                                            mr: 1,
                                            '& .MuiInput-underline:before': {
                                                borderBottomColor: 'grey.500',
                                            },
                                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                                borderBottomColor: 'primary.main',
                                            },
                                        }}
                                    />
                                    <IconButton color="primary" onClick={handleAddComment} disabled={!newComment.trim()}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                                <Box sx={{ maxHeight: '200px', overflowY: 'auto', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                                    {selectedTicket?.comments?.length > 0 ? (
                                        selectedTicket.comments.slice().reverse().map((comment) => (
                                            <Box key={comment.id} sx={{ borderBottom: '1px solid #e0e0e0', py: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>{users.find(user => user.id === comment.user_id)?.fullname || 'Unknown User'}:</strong> {comment.content}
                                                </Typography>
                                                <Typography variant="caption">{new Date(comment.created_at).toLocaleString()}</Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2">No comments available.</Typography>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {value === 1 && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>Attachments:</Typography>
                                {selectedTicket?.attachments?.length > 0 ? (
                                    selectedTicket.attachments.map((attachment) => (
                                        <Box key={attachment.id} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                            <IconButton onClick={() => handleDownloadAttachment(selectedTicket.id, attachment.id)}>
                                                <DownloadIcon />
                                            </IconButton>
                                            <Typography variant="body2" sx={{ ml: 1 }}>{attachment.filename}</Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2">No attachments available.</Typography>
                                )}
                            </Box>
                        )}

                        {value === 2 && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>Activity:</Typography>
                                <Box sx={{ maxHeight: '200px', overflowY: 'auto', p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                                    {selectedTicket?.activity_logs?.length > 0 ? (
                                        selectedTicket.activity_logs.map((log) => (
                                            <Box key={log.id} sx={{ borderBottom: '1px solid #e0e0e0', py: 2 }}>
                                                <Typography variant="body2">
                                                    {log.action} by {users.find(user => user.id === log.user_id)?.fullname || 'Unknown User'}
                                                </Typography>
                                                <Typography variant="caption">{new Date(log.created_at).toLocaleString()}</Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2">No activity logs available.</Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Card>

           
            {/* <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar> */}

            <CommentModal
                show={showCommentModal}
                onClose={() => { setShowCommentModal(false); setLoading(true) }}
                onSubmit={handleCommentSubmit}
                approvers={users.filter(user => user.approver)}
                loading={loadingApprovers}
                ticketId={selectedTicket?.id}
                currentUserId={users.find(user => user.username === currentUser)?.id}
                status={selectedTicket.status}
                newStatus={updatedStatus}
            />

            <Dialog
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                fullWidth
                maxWidth="xs"
                sx={{
                    '& .MuiDialog-paper': {
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '0.875rem',
                        color: '#333',
                    },
                }}
            >
                <DialogTitle>
                    Delete Ticket
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowDeleteModal(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Typography variant="body1">
                        Are you sure you want to delete the ticket?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        #{ticketToDelete?.id} - {ticketToDelete?.title}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" size="small" onClick={() => setShowDeleteModal(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(ticketToDelete?.id)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

};

export default TicketView;
