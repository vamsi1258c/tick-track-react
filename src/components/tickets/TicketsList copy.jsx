import React, { useEffect, useState, useCallback } from 'react';
import { fetchTickets, deleteTicket } from '../../services/ticket';
import { fetchUsers } from '../../services/authService';
import { downloadAttachment } from '../../services/attachment';
import { Button, Table, Form, Modal, Spinner, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaSort, FaPlus, FaDownload } from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import Select from 'react-select';
import './TicketsList.css';
import DOMPurify from 'dompurify';


const TicketsList = ({ currentUser, userRole }) => {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [statusFilter, setStatusFilter] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userFilter, setUserFilter] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    const navigate = useNavigate();

    const stripHtml = (html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    const loadTickets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchTickets();
            const responseUsers = await fetchUsers();
            setUsers(responseUsers.data);

            let filteredTickets = response.data;

            if (userRole === 'admin' || userRole === 'support') {
                // Admins and support can see all tickets, no filter needed
            } else {
                // Other users can only see tickets they created
                filteredTickets = filteredTickets.filter(ticket => ticket.creator?.username === currentUser);
            }


            if (filter === 'assigned_to_me') {
                filteredTickets = filteredTickets.filter(ticket => ticket.assignee?.username === currentUser);
            } else if (filter === 'created_by_me') {
                filteredTickets = filteredTickets.filter(ticket => ticket.creator?.username === currentUser);
            }
            if (userFilter.length > 0) {
                filteredTickets = filteredTickets.filter(ticket => userFilter.includes(ticket.assignee.username));
            }
            if (statusFilter.length > 0) {
                filteredTickets = filteredTickets.filter(ticket => statusFilter.includes(ticket.status));
            }
            if (priorityFilter.length > 0) {
                filteredTickets = filteredTickets.filter(ticket => priorityFilter.includes(ticket.priority));
            }
            if (categoryFilter.length > 0) {
                filteredTickets = filteredTickets.filter(ticket => categoryFilter.includes(ticket.category));
            }


            if (searchText?.trim()) {
                const searchLower = searchText.toLowerCase().trim();

                filteredTickets = filteredTickets.filter(ticket => {
                    const title = ticket.title?.toLowerCase() || '';
                    // Convert description to plain text by stripping HTML tags
                    const plainDescription = stripHtml(ticket.description)?.toLowerCase() || '';

                    return title.includes(searchLower) || plainDescription.includes(searchLower);
                });
            }


            // Sorting logic
            filteredTickets.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });

            setTickets(filteredTickets);
        } catch (error) {
            console.error('Failed to load tickets', error);
        }
        setLoading(false);
    }, [filter, currentUser, priorityFilter, categoryFilter, statusFilter, searchText, sortConfig, userRole, userFilter]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            loadTickets();
        } catch (error) {
            console.error('Failed to delete ticket', error);
            if (error.response && error.response.status === 401) {
                navigate('/signin');
            }
        }
        setShowDeleteModal(false);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': return <Badge bg="danger">High</Badge>;
            case 'medium': return <Badge bg="warning">Medium</Badge>;
            case 'low': return <Badge bg="success">Low</Badge>;
            default: return <Badge bg="secondary">N/A</Badge>;
        }
    };

    const renderCategoryBadge = (category) => {
        switch (category) {
            case 'service':
                return <Badge bg="primary">Service</Badge>;
            case 'troubleshooting':
                return <Badge bg="info">Troubleshooting</Badge>;
            case 'maintenance':
                return <Badge bg="success">Maintenance</Badge>;
            default:
                return <Badge bg="dark">N/A</Badge>;
        }
    };


    const handleViewTicket = (ticket) => {
        console.log(ticket);
        setSelectedTicket(ticket);
        setShowViewModal(true);
    };

    const handleDownloadAttachment = async (ticketid, attachmentId) => {
        try {
            await downloadAttachment(ticketid, attachmentId); // Call the service to download the attachment
        } catch (error) {
            console.error('Failed to download attachment', error);
        }
    };

    const handleAddUser = () => {
        navigate('/create-ticket');
    };

    const handleRefresh = () => {
        loadTickets();
    };

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'closed', label: 'Closed' },
        { value: 'resolved', label: 'Resolved' },
    ];

    const categoryOptions = [
        { value: 'service', label: 'Service' },
        { value: 'troubleshooting', label: 'Troubleshooting' },
        { value: 'maintenance', label: 'Maintenance' },
    ];

    return (
        <div className="ticket-list-container">
            <div className="sticky-header">
                <div className="header-container d-flex justify-content-between align-items-center">
                    <h2 className="my-2">Tickets</h2>
                    <div className="button-container d-flex">
                        <Button variant="secondary" onClick={handleRefresh} className="ml-2 btn-sm">
                            <AiOutlineReload /> Refresh
                        </Button>
                        <Button variant="primary" onClick={handleAddUser} className="btn-sm ml-2">
                            <FaPlus /> Add
                        </Button>
                    </div>
                </div>
                <div className="search-filter-container">
                    <Row>
                        {/* Search Bar */}
                        <Col xs={12} sm={6} md={4} className="mb-3">
                            <InputGroup className="mx-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by title or description"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="search-input"
                                />
                                <Button variant="outline-secondary">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>

                        {/* Tickets Filter */}
                        <Col xs={12} sm={6} md={4} className="mb-3">
                            <Select
                                className="mx-2 select-filter" // Apply consistent style class
                                options={[
                                    { value: 'assigned_to_me', label: 'Assigned to Me' },
                                    { value: 'created_by_me', label: 'Created by Me' },
                                ]}
                                onChange={(option) => {
                                    setFilter(option ? option.value : 'all');
                                }}
                                placeholder="Filter by Tickets"
                                isClearable
                            />
                        </Col>

                        {/* Assignee Filter */}
                        <Col xs={12} md={4} className="mb-3">
                            <Select
                                className="mx-2 select-filter"
                                options={users.map(user => ({ value: user.username, label: user.username }))}
                                isMulti
                                onChange={(selectedOptions) => setUserFilter(selectedOptions.map(option => option.value))}
                                placeholder="Filter by Assignee"
                                isClearable
                            />
                        </Col>

                        {/* Priorities Filter */}
                        <Col xs={12} sm={6} md={4} className="mb-3">
                            <Select
                                className="mx-2 select-filter"
                                options={priorityOptions}
                                isMulti
                                onChange={(selectedOptions) => setPriorityFilter(selectedOptions.map(option => option.value))}
                                placeholder="Select Priorities"
                                isClearable
                            />
                        </Col>

                        {/* Statuses Filter */}
                        <Col xs={12} sm={6} md={4} className="mb-3">
                            <Select
                                className="mx-2 select-filter"
                                options={statusOptions}
                                isMulti
                                onChange={(selectedOptions) => setStatusFilter(selectedOptions.map(option => option.value))}
                                placeholder="Select Statuses"
                                isClearable
                            />
                        </Col>

                        {/* Dummy Category Filter */}
                        <Col xs={12} sm={6} md={4} className="mb-3">
                            <Select
                                className="mx-2 select-filter"
                                options={categoryOptions}
                                isMulti
                                onChange={(selectedOptions) => setCategoryFilter(selectedOptions.map(option => option.value))}
                                placeholder="Select Category"
                                isClearable
                            />
                        </Col>
                    </Row>
                </div>
            </div>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="table-responsive">
                    <Table striped hover responsive className="custom-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID <FaSort /></th>
                                <th onClick={() => handleSort('title')}>Title <FaSort /></th>
                                <th onClick={() => handleSort('category')}>Category<FaSort /></th>
                                <th>Description</th>
                                <th onClick={() => handleSort('status')}>Status <FaSort /></th>
                                <th onClick={() => handleSort('priority')}>Priority <FaSort /></th>
                                <th onClick={() => handleSort('assignee')}>Assigned To <FaSort /></th>
                                <th onClick={() => handleSort('created_at')}>Created At <FaSort /></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length > 0 ? tickets.map(ticket => (
                                <tr key={ticket.id} onClick={() => handleViewTicket(ticket)}>
                                    <td>{ticket.id}</td>
                                    <td>{ticket.title}</td>
                                    <td>{renderCategoryBadge(ticket.category)}</td>
                                    {/* <td>{ticket.description.length > 30 ? `${ticket.description.slice(0, 30)}...` : ticket.description}</td> */}
                                    <td>
                                        {ticket.description.length > 30
                                            ? (
                                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket.description.slice(0, 30)) + '...' }} />
                                            )
                                            : (
                                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket.description) }} />
                                            )
                                        }
                                    </td>
                                    <td>{ticket.status}</td>
                                    <td>{renderPriorityBadge(ticket.priority)}</td>
                                    <td>{ticket.assignee?.username}</td>
                                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                                    <td className="action-buttons">
                                        <Button variant="light" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/edit-ticket', { state: { ticketId: ticket.id } }); }}>
                                            <FaEdit />
                                        </Button>
                                        {ticket.creator?.username === currentUser && (
                                            <Button variant="light" size="sm" onClick={(e) => { e.stopPropagation(); setTicketToDelete(ticket); setShowDeleteModal(true); }}>
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="text-center">No tickets found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the ticket: {ticketToDelete?.title}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(ticketToDelete?.id)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Ticket Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <div>Ticket#: {selectedTicket?.id}</div>
                        <div>{selectedTicket?.title}</div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Description:</strong> <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTicket?.description || '') }} /></p>
                    <p><strong>Category:</strong> {renderCategoryBadge(selectedTicket?.category)}</p>
                    <p><strong>Status:</strong> {selectedTicket?.status}</p>
                    <p><strong>Priority:</strong> {renderPriorityBadge(selectedTicket?.priority)}</p>
                    <p><strong>Created By:</strong> {selectedTicket?.creator?.username}</p>
                    <p><strong>Assigned To:</strong> {selectedTicket?.assignee?.username}</p>
                    <p><strong>Created At:</strong> {new Date(selectedTicket?.created_at).toLocaleString()}</p>
                    <p><strong>Updated At:</strong> {new Date(selectedTicket?.updated_at).toLocaleString()}</p>

                    <hr />

                    <h5>Comments:</h5>
                    {selectedTicket?.comments.length > 0 ? (
                        selectedTicket.comments.map((comment) => (
                            <div key={comment.id}>
                                <p><strong>{users.find(user => user.id === comment?.user_id)?.username || 'Unknown User'}:</strong> {comment.content} <em>({new Date(comment.created_at).toLocaleString()})</em></p>
                            </div>
                        ))
                    ) : (
                        <p>No comments available.</p>
                    )}

                    <hr />

                    <h5>Activity Logs:</h5>
                    {selectedTicket?.activity_logs.length > 0 ? (
                        selectedTicket.activity_logs.map((log) => (
                            <div key={log.id}>
                                <p>{users.find(user => user.id === log.user_id).fullname} {log.action}, at {new Date(log.created_at).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p>No activity logs available.</p>
                    )}

                    <hr />

                    <h5>Attachments:</h5>
                    {selectedTicket?.attachments.length > 0 ? (
                        selectedTicket.attachments.map((attachment) => (
                            <div key={attachment.id}>
                                <p>

                                    <button
                                        onClick={() => handleDownloadAttachment(selectedTicket.id, attachment.id)} // Use button for download

                                        className="attachment-button"
                                    > <FaDownload style={{ marginRight: '5px' }} />
                                        {attachment.filename}
                                    </button>


                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No attachments available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Back
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/edit-ticket', { state: { ticketId: selectedTicket.id } })}>
                        Edit Ticket
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TicketsList;
