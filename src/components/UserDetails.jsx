import { Grid, Avatar, Dialog, DialogActions, DialogContent, DialogTitle, Button, Accordion, AccordionSummary, AccordionDetails, Table, TableHead, TableBody, TableRow, TableCell, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExpandMore as ExpandMoreIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import './UserDetails.css';

export const UserDetails = ({ showModal, handleClose, selectedUser }) => {
  const navigate = useNavigate();

  // const handleViewClick = (ticketId) => {
  //   navigate(`/view-ticket`, { state: { ticketId } });
  // };

  return (
    <Dialog open={showModal} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>User Details</DialogTitle>
      <DialogContent>
        {selectedUser && (
          <div>
            <Paper sx={{ padding: 3, marginBottom: 3, backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 3 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Avatar */}
                <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    alt={selectedUser.fullname}
                    src={selectedUser.avatar || "/default-avatar.png"}
                    sx={{ width: 100, height: 100 }}
                  />
                </Grid>

                {/* User Info */}
                <Grid item xs={12} sm={9}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                    {selectedUser.fullname}
                  </Typography>
                  <Typography variant="body1" sx={{ marginBottom: 0.5 }}><strong>Email:</strong> {selectedUser.username}</Typography>
                  <Typography variant="body1" sx={{ marginBottom: 0.5 }}><strong>Role:</strong> {selectedUser.role}</Typography>
                  <Typography variant="body1" sx={{ marginBottom: 0.5 }}><strong>Designation:</strong> {selectedUser.designation || "Not specified"}</Typography>
                  <Typography variant="body1" sx={{ marginBottom: 0.5 }}><strong>Approver:</strong> {selectedUser.approver ? "Yes" : "No"}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Tickets Section */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="created-tickets-header">
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tickets Created</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedUser.tickets_created && selectedUser.tickets_created.length > 0 ? (
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedUser.tickets_created.map((ticket) => (
                          <TableRow key={ticket.id} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' } }}>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>{ticket.status}</TableCell>
                            <TableCell>{ticket.priority}</TableCell>
                            <TableCell>
                              <VisibilityIcon
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  color: '#3f51b5',
                                }}
                                onClick={() => navigate(`/view-ticket`, { state: { ticketId: ticket.id } })}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography>No tickets created.</Typography>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>

            {/* Tickets Assigned */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id="assigned-tickets-header">
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tickets Assigned To</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedUser.tickets_assigned && selectedUser.tickets_assigned.length > 0 ? (
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedUser.tickets_assigned.map((ticket) => (
                          <TableRow key={ticket.id} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' } }}>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>{ticket.status}</TableCell>
                            <TableCell>{ticket.priority}</TableCell>
                            <TableCell>
                            <VisibilityIcon
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  color: '#3f51b5',
                                }}
                                onClick={() => navigate(`/view-ticket`, { state: { ticketId: ticket.id } })}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography>No tickets assigned.</Typography>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>

            {/* Tickets Approved (only visible if user is an approver) */}
            {selectedUser.approver && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} id="approved-tickets-header">
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tickets Approved</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedUser.tickets_approved && selectedUser.tickets_approved.length > 0 ? (
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedUser.tickets_approved.map((ticket) => (
                            <TableRow key={ticket.id} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' } }}>
                              <TableCell>{ticket.title}</TableCell>
                              <TableCell>{ticket.status}</TableCell>
                              <TableCell>{ticket.priority}</TableCell>
                              <TableCell>
                              <VisibilityIcon
                                sx={{
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  color: '#3f51b5',
                                }}
                                onClick={() => navigate(`/view-ticket`, { state: { ticketId: ticket.id } })}
                              />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography>No tickets approved.</Typography>
                    )}
                  </div>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Activity Logs Section */}
            <Paper sx={{ padding: 3, marginTop: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ marginBottom: 1 }}>Activity:</Typography>
              {selectedUser.activity_logs && selectedUser.activity_logs.length > 0 ? (
                <ul>
                  {selectedUser.activity_logs.map((log) => (
                    <li key={log.id}>
                      <Typography variant="body2">
                        <strong>{log.action}</strong> at {new Date(log.created_at).toLocaleString()}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">No activity logs available.</Typography>
              )}
            </Paper>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetails;
