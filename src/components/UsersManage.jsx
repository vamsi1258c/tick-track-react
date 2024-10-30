import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Modal, Button, Form } from 'react-bootstrap';
import { fetchUsers, deleteUser } from '../services/authService';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const UsersManage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('id'); // Default sort by 'id'
    const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetchUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleDeleteModalOpen = (userId) => {
        setUserIdToDelete(userId);
        setShowDeleteModal(true);
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
        setUserIdToDelete(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteUser(userIdToDelete);
            const updatedUsers = users.filter(user => user.id !== userIdToDelete);
            setUsers(updatedUsers);

        } catch (err) {
            setError(`User ${userIdToDelete} cannot be deleted. Please delete the dependent tickets first.`);

        }
        handleDeleteModalClose();
    };

    const handleEdit = (user) => {
        navigate(`/signup`, { state: { user } });
    };

    const handleAddUser = () => {
        navigate('/signup');
    };

    const handleRefresh = () => {
        loadUsers();
        setError('');
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase().trim()) || user.fullname.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    const sortUsers = (users) => {
        return [...users].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const handleSort = (key) => {
        const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortKey(key);
        setSortDirection(newDirection);
    };

    const sortedUsers = sortUsers(filteredUsers);

    return (
        <div>
            <div className="header-container d-flex justify-content-between align-items-center">
                <h2>Manage Users</h2>

                <div className="button-container d-flex">
                    <Button variant="secondary" onClick={handleRefresh} className="ml-2 btn-sm">
                        <AiOutlineReload /> Refresh
                    </Button>

                    <Button variant="primary" onClick={handleAddUser} className="ml-2 btn-sm">
                        <FaPlus /> Add
                    </Button>
                </div>
            </div>

            <Form.Control
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ml-2 mb-3"
            />

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                                    ID {sortKey === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                                    Full Name {sortKey === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                                    Email {sortKey === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                                    Role {sortKey === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user) => (
                                <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(user)}>
                                    <td>{user.id}</td>
                                    <td>{user.fullname}</td>
                                    <td>{user.username}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <FaEdit
                                            style={{ cursor: 'pointer', fontSize: '1rem', marginRight: '10px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(user);
                                            }}
                                        />
                                        <FaTrash
                                            style={{ cursor: 'pointer', fontSize: '1rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteModalOpen(user.id);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Modal for displaying full user details */}
                    {/* Modal for displaying full user details */}
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

                                    {/* New fields: Designation and Approver */}
                                    <p><strong>Designation:</strong> {selectedUser.designation || "Not specified"}</p>
                                    <p><strong>Approver:</strong> {selectedUser.approver ? "Yes" : "No"}</p>

                                    <hr />

                                    <h5>Tickets Created:</h5>
                                    {selectedUser.tickets_created && selectedUser.tickets_created.length > 0 ? (
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.tickets_created.map((ticket) => (
                                                    <tr key={ticket.id}>
                                                        <td><strong>{ticket.title}</strong></td>
                                                        <td><div dangerouslySetInnerHTML={{ __html: ticket.description }} /></td>
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

                                    <h5>Tickets Assigned:</h5>
                                    {selectedUser.tickets_assigned && selectedUser.tickets_assigned.length > 0 ? (
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.tickets_assigned.map((ticket) => (
                                                    <tr key={ticket.id}>
                                                        <td><strong>{ticket.title}</strong></td>
                                                        <td>{ticket.description}</td>
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

                                    {/* Display Tickets Approved if the user is an approver */}
                                    {selectedUser.approver && (
                                        <>
                                            <h5>Tickets Approved:</h5>
                                            {selectedUser.tickets_approved && selectedUser.tickets_approved.length > 0 ? (
                                                <Table striped bordered hover>
                                                    <thead>
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>Description</th>
                                                            <th>Status</th>
                                                            <th>Priority</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedUser.tickets_approved.map((ticket) => (
                                                            <tr key={ticket.id}>
                                                                <td><strong>{ticket.title}</strong></td>
                                                                <td>{ticket.description}</td>
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
                                        </>
                                    )}

                                    <h5>Comments:</h5>
                                    {selectedUser.comments && selectedUser.comments.length > 0 ? (
                                        <ul>
                                            {selectedUser.comments.map((comment) => (
                                                <li key={comment.id}>
                                                    <p style={{ fontSize: '0.75rem' }}>{comment.content} (Created At: {new Date(comment.created_at).toLocaleString()})</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: '0.75rem' }}>No comments available.</p>
                                    )}

                                    <h5>Attachments:</h5>
                                    {selectedUser.attachments && selectedUser.attachments.length > 0 ? (
                                        <ul>
                                            {selectedUser.attachments.map((attachment) => (
                                                <li key={attachment.id}>
                                                    <i className="fa fa-download" aria-hidden="true" style={{ marginRight: '5px' }}></i>
                                                    {attachment.filename} (Uploaded At: {new Date(attachment.uploaded_at).toLocaleString()})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: '0.75rem' }}>No attachments available.</p>
                                    )}

                                    <h5>Activity Logs:</h5>
                                    {selectedUser.activity_logs && selectedUser.activity_logs.length > 0 ? (
                                        <ul>
                                            {selectedUser.activity_logs.map((log) => (
                                                <li key={log.id}>
                                                    <p style={{ fontSize: '0.75rem' }}><strong>{log.action}</strong> - {new Date(log.created_at).toLocaleString()}</p>
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

                    {/* <Modal show={showModal} onHide={handleClose} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>User Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedUser && (
                                <div>
                                    <p><strong>Name:</strong> {selectedUser.fullname}</p>
                                    <p><strong>Email:</strong> {selectedUser.username}</p>
                                    <p><strong>Role:</strong> {selectedUser.role}</p>
                                    <hr />

                                    <h5>Tickets Created:</h5>
                                    {selectedUser.tickets_created && selectedUser.tickets_created.length > 0 ? (
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.tickets_created.map((ticket) => (
                                                    <tr key={ticket.id}>
                                                        <td><strong>{ticket.title}</strong></td>
                                                        <td><div dangerouslySetInnerHTML={{ __html: ticket.description }} /></td>
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

                                    <h5>Tickets Assigned:</h5>
                                    {selectedUser.tickets_assigned && selectedUser.tickets_assigned.length > 0 ? (
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Priority</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUser.tickets_assigned.map((ticket) => (
                                                    <tr key={ticket.id}>
                                                        <td><strong>{ticket.title}</strong></td>
                                                        <td>{ticket.description}</td>
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
                                    <h5>Comments:</h5>
                                    {selectedUser.comments && selectedUser.comments.length > 0 ? (
                                        <ul>
                                            {selectedUser.comments.map((comment) => (
                                                <li key={comment.id}>
                                                    <p>{comment.content} (Created At: {new Date(comment.created_at).toLocaleString()})</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No comments available.</p>
                                    )}

                                    <h5>Attachments:</h5>
                                    {selectedUser.attachments && selectedUser.attachments.length > 0 ? (
                                        <ul>
                                            {selectedUser.attachments.map((attachment) => (
                                                <li key={attachment.id}>
                                                    <i className="fa fa-download" aria-hidden="true" style={{ marginRight: '5px' }}></i>
                                                    {attachment.filename} (Uploaded At: {new Date(attachment.uploaded_at).toLocaleString()})
                                                </li>

                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No attachments available.</p>
                                    )}

                                    <h5>Activity Logs:</h5>
                                    {selectedUser.activity_logs && selectedUser.activity_logs.length > 0 ? (
                                        <ul>
                                            {selectedUser.activity_logs.map((log) => (
                                                <li key={log.id}>
                                                    <p><strong>{log.action}</strong> - {new Date(log.created_at).toLocaleString()}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No activity logs available.</p>
                                    )}
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>Close</Button>
                        </Modal.Footer>
                    </Modal> */}

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteModal} onHide={handleDeleteModalClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" size = 'sm' onClick={handleDeleteModalClose}>Cancel</Button>
                            <Button variant="danger" size = 'sm' onClick={confirmDelete}>Delete</Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default UsersManage;
