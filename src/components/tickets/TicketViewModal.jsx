import {
  Dialog,
  Box,
  Typography,
  Divider,
  IconButton,
  Button,
  Paper,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarTodayIcon,
  Update as UpdateIcon,
  Category as CategoryIcon,
  Assignment as StatusIcon,
  PriorityHigh as PriorityIcon,
  OpenInFull as OpenInFullIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import './TicketDetail.css';

const TicketViewModal = ({
  show,
  onClose,
  selectedTicket,
  users,
  renderCategoryBadge,
  renderStatusBadge,
  renderPriorityBadge,
  navigate,
  currentUser,
  refreshTickets,
}) => {
  function toTitleCase(text) {
    return text
      ?.split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return (
    <Dialog open={show} onClose={onClose} maxWidth="md" fullWidth>
      <Paper sx={{ p: 1, borderRadius: 3, boxShadow: 3 }}>
        {/* Modal Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: '1rem',
            }}
          >
            Review Ticket #{selectedTicket?.id}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 0, padding: '0.25rem' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() =>
              navigate('/view-ticket', {
                state: { ticketId: selectedTicket.id },
              })
            }
            sx={{
              position: 'absolute',
              left: 0,
              padding: '0.25rem',
              backgroundColor: 'transparent',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <OpenInFullIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Ticket Details Section */}
        <Box sx={{ mt: 1 }}>
          <Card sx={{ mb: 1, padding: '0.5rem' }}>
            <CardContent>
              {/* Title */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <strong>{selectedTicket?.title}</strong>
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: '0.875rem' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedTicket?.description || ''
                    ),
                  }}
                />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={3} sx={{ mt: 2, mb: 0 }}>
                {/* Status */}
                <Box display="flex" alignItems="center">
                  <StatusIcon sx={{ color: 'info.main', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Status:</strong>{' '}
                    {renderStatusBadge(selectedTicket?.status)}
                  </Typography>
                </Box>

                {/* Priority */}
                <Box display="flex" alignItems="center">
                  <PriorityIcon sx={{ color: 'error.main', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Priority:</strong>{' '}
                    {renderPriorityBadge(selectedTicket?.priority)}
                  </Typography>
                </Box>

                {/* Category */}
                <Box display="flex" alignItems="center">
                  <CategoryIcon sx={{ color: 'secondary.main', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Category:</strong>{' '}
                    {renderCategoryBadge(selectedTicket?.category)}
                    {selectedTicket?.subcategory && (
                      <Chip
                        label={toTitleCase(selectedTicket.subcategory)}
                        size="small"
                        sx={{
                          padding: '1px 4px',
                          fontSize: '0.7rem',
                          height: '20px',
                          fontWeight: 550,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    )}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* User Info Group */}
          <Card sx={{ mb: 1, boxShadow: 3 }}>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                {/* Creator */}
                <Grid item xs={3} container alignItems="center">
                  <PersonIcon
                    color="primary"
                    sx={{ mr: 1, fontSize: '1rem' }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Creator:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {selectedTicket?.creator?.username || 'N/A'}
                  </Typography>
                </Grid>

                {/* Assignee */}
                <Grid item xs={3} container alignItems="center">
                  <AssignmentIndIcon
                    color="secondary"
                    sx={{ mr: 1, fontSize: '1rem' }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Assignee:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {selectedTicket?.assignee?.username || 'N/A'}
                  </Typography>
                </Grid>

                {/* Approver (optional) */}
                {selectedTicket?.approver && (
                  <>
                    <Grid item xs={3} container alignItems="center">
                      <CheckCircleIcon
                        color="success"
                        sx={{ mr: 1, fontSize: '1rem' }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong>Approver:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {selectedTicket?.approver?.username}
                      </Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={3} container alignItems="center">
                  <CalendarTodayIcon
                    color="action"
                    sx={{ mr: 1, fontSize: '1rem' }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Created:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {new Date(selectedTicket?.created_at).toLocaleString() ||
                      'N/A'}
                  </Typography>
                </Grid>

                {/* Updated Date */}
                <Grid item xs={3} container alignItems="center">
                  <UpdateIcon
                    color="warning"
                    sx={{ mr: 1, fontSize: '1rem' }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    <strong>Updated:</strong>
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {new Date(selectedTicket?.updated_at).toLocaleString() ||
                      'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Modal Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ px: 2, py: 0.6, fontSize: '0.75rem' }}
            onClick={onClose}
          >
            <ArrowBackIcon /> Back
          </Button>
          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{ mr: 1, px: 2, py: 0.6, fontSize: '0.75rem' }}
              onClick={() =>
                navigate('/view-ticket', {
                  state: { ticketId: selectedTicket.id },
                })
              }
            >
              {' '}
              <VisibilityIcon />
              View
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ mr: 1, px: 2, py: 0.6, fontSize: '0.75rem' }}
              onClick={() =>
                navigate('/edit-ticket', {
                  state: { ticketId: selectedTicket.id },
                })
              }
            >
              {' '}
              <EditIcon />
              Edit
            </Button>
          </Box>
        </Box>
      </Paper>
    </Dialog>
  );
};

export default TicketViewModal;
