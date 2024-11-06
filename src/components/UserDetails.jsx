import { Modal, Button, Tabs, Tab, Table } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './UserDetails.css'; 

export const UserDetails = ({ showModal, handleClose, selectedUser }) => {
    const navigate = useNavigate();

    return (
        <Modal show={showModal} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>User Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedUser && (
                    <div>
                        <p><strong>Name:</strong> {selectedUser.fullname}</p>
                        <p><strong>Email:</strong> {selectedUser.username}</p>
                        <p><strong>Role:</strong> {selectedUser.role}</p>
                        <p><strong>Designation:</strong> {selectedUser.designation || "Not specified"}</p>
                        <p><strong>Approver:</strong> {selectedUser.approver ? "Yes" : "No"}</p>
                        <hr />

                        {/* Tickets Section */}
                        <h5>Tickets</h5>
                        <Tabs defaultActiveKey="created" id="user-details-tabs" className="mb-3">
                            {/* Tickets Created */}
                            <Tab eventKey="created" title="Created">
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedUser.tickets_created && selectedUser.tickets_created.length > 0 ? (
                                        <Table bordered hover responsive className="user-tickets-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.tickets_created.map((ticket) => (
                                                    <tr key={ticket.id}>
                                                        <td><strong>{ticket.title}</strong></td>
                                                        <td>{ticket.status}</td>
                                                        <td>{ticket.priority}</td>
                                                        <td>
                                                            <FaEdit
                                                                style={{ cursor: 'pointer', fontSize: '1rem' }}
                                                                onClick={() => navigate(`/edit-ticket`, { state: { ticketId: ticket.id } })}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p>No tickets created.</p>
                                    )}
                                </div>
                            </Tab>

                            {/* Tickets Assigned */}
                            <Tab eventKey="assigned" title="Assigned To">
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedUser.tickets_assigned && selectedUser.tickets_assigned.length > 0 ? (
                                        <Table bordered hover responsive className="user-tickets-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.tickets_assigned.map((ticket) => (
                                                    <tr key={ticket.id}>
                                                        <td><strong>{ticket.title}</strong></td>
                                                        <td>{ticket.status}</td>
                                                        <td>{ticket.priority}</td>
                                                        <td>
                                                            <FaEdit
                                                                style={{ cursor: 'pointer', fontSize: '1rem' }}
                                                                onClick={() => navigate(`/edit-ticket`, { state: { ticketId: ticket.id } })}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p>No tickets assigned.</p>
                                    )}
                                </div>
                            </Tab>

                            {/* Tickets Approved (only visible if user is an approver) */}
                            {selectedUser.approver && (
                                <Tab eventKey="approved" title="Approved">
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {selectedUser.tickets_approved && selectedUser.tickets_approved.length > 0 ? (
                                            <Table bordered hover responsive className="user-tickets-table">
                                                <thead>
                                                    <tr>
                                                        <th>Title</th>
                                                        <th>Status</th>
                                                        <th>Priority</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedUser.tickets_approved.map((ticket) => (
                                                        <tr key={ticket.id}>
                                                            <td>{ticket.title}</td>
                                                            <td>{ticket.status}</td>
                                                            <td>{ticket.priority}</td>
                                                            <td>
                                                                <FaEdit
                                                                    style={{ cursor: 'pointer', fontSize: '1rem' }}
                                                                    onClick={() => navigate(`/edit-ticket`, { state: { ticketId: ticket.id } })}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        ) : (
                                            <p>No tickets approved.</p>
                                        )}
                                    </div>
                                </Tab>
                            )}
                        </Tabs>

                        <hr />

                        {/* Activity Logs Section */}
                        <h5>Activity:</h5>
                        {selectedUser.activity_logs && selectedUser.activity_logs.length > 0 ? (
                            <ul>
                                {selectedUser.activity_logs.map((log) => (
                                    <li key={log.id}>
                                        <p style={{ fontSize: '0.75rem' }}>
                                            <strong>{log.action}</strong> at {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ fontSize: '0.75rem' }}>No activity logs available.</p>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserDetails;
