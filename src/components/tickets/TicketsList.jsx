import React, { useEffect, useState, useCallback } from 'react';
import { fetchTickets, deleteTicket } from '../../services/ticket';
import { fetchUsers } from '../../services/authService';
import { downloadAttachment } from '../../services/attachment';
import { Button, Dropdown, Table, Form, Modal, Spinner, InputGroup, Badge, Row, Col, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaSearch, FaAngleUp, FaAngleDown, FaPlus, FaSlidersH } from 'react-icons/fa';
import { AiOutlineReload, } from 'react-icons/ai';
import Select from 'react-select';
import './TicketsList.css';
import TicketViewModal from './TicketDetail';


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
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage, setTicketsPerPage] = useState(10);
    const totalPages = Math.ceil(tickets.length / ticketsPerPage);
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handlePreviousPage = () => setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage);
    const handleNextPage = () => setCurrentPage(currentPage < totalPages ? currentPage + 1 : currentPage);


    const handleTicketsPerPageChange = (number) => {
        setTicketsPerPage(number);
        setCurrentPage(1);
    };
    const navigate = useNavigate();

    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

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
                    const plainDescription = stripHtml(ticket.description)?.toLowerCase() || '';
                    const id = String(ticket.id) || '';
                    return id.includes(searchLower) || title.includes(searchLower) || plainDescription.includes(searchLower);
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
            case 'high':
                return <Badge bg="warning">High</Badge>;
            case 'medium':
                return <Badge bg="light" style={{ color: '#001f3f' }}>Medium</Badge>;
            case 'low':
                return <Badge bg="white" style={{ color: '#3D9970' }}>Low</Badge>;
            case 'urgent':
                return <Badge bg="danger">Urgent</Badge>;
            default:
                return <Badge bg="muted" style={{ color: '#6A5ACD' }}>N/A</Badge>;
        }
    };

    const renderCategoryBadge = (category) => {
        switch (category) {
            case 'service':
                return <Badge bg="light" style={{ color: '#3D9970' }}>Service</Badge>;
            case 'troubleshooting':
                return <Badge bg="white" style={{ color: '#FF6347' }}>Troubleshooting</Badge>;
            case 'maintenance':
                return <Badge bg="light" style={{ color: '#DAA520' }}>Maintenance</Badge>;
            default:
                return <Badge bg="muted" style={{ color: '#6A5ACD' }}>N/A</Badge>;
        }
    };

    const renderStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return <Badge bg="info">Open</Badge>;
            case 'in_progress':
                return <Badge bg="primary">In Progress</Badge>;
            case 'closed':
                return <Badge bg="secondary">Closed</Badge>;
            case 'resolved':
                return <Badge bg="success">Closed</Badge>;
            case 'to_be_approved':
                return <Badge bg="muted" style={{ color: '#6A5ACD' }}>ToBeApproved</Badge>;
            default:
                return <Badge bg="muted" style={{ color: '#6A5ACD' }}>{status}</Badge>;
        }
    };



    const handleViewTicket = (ticket) => {
        console.log(ticket);
        setSelectedTicket(ticket);
        setShowViewModal(true);
    };

    const handleDownloadAttachment = async (ticketid, attachmentId) => {
        try {
            await downloadAttachment(ticketid, attachmentId);
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

                <Button onClick={toggleFilters} className="mb-3" style={{
                    padding: '0',
                    minWidth: '30px',
                    height: '30px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'black'
                }}><FaSlidersH />
                    {filtersVisible ? <FaAngleUp style={{ fontSize: '0.75rem', color: 'black' }} /> : <FaAngleDown style={{ fontSize: '0.75rem', color: 'black' }} />}
                </Button>
                <div className="search-filter-container">
                    {filtersVisible && (
                        <Row>
                            {/* Search Bar */}
                            <Col xs={12} sm={6} md={4} className="mb-3">
                                <InputGroup className="mx-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by id, title or description"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value.trim())}
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
                                    placeholder="Filter by Me"
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
                        </Row>)}
                </div>
            </div>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover responsive className="custom-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('title')}>Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Assignee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTickets.length > 0 ? currentTickets.map(ticket => (
                                <tr key={ticket.id} onClick={() => handleViewTicket(ticket)}>
                                    <td>{ticket.id}</td>
                                    <td>{ticket.title}</td>
                                    <td>{renderCategoryBadge(ticket.category)}</td>
                                    <td>{renderStatusBadge(ticket.status)}</td>
                                    <td>{renderPriorityBadge(ticket.priority)}</td>
                                    <td>{ticket.assignee?.username}</td>
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
                                    <td colSpan="7" className="text-center">No tickets found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination Section at the Top */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Pagination className="m-0 pagination" size="sm">
                            <Pagination.Prev onClick={handlePreviousPage} disabled={currentPage === 1} />
                            {[...Array(totalPages)].map((_, index) => (
                                <Pagination.Item
                                    key={index}
                                    active={index + 1 === currentPage}
                                    onClick={() => handlePageChange(index + 1)}>
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages} />
                        </Pagination>

                        {/* Dropdown for Tickets Per Page */}
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic" size='sm'>
                                Tickets per page: {ticketsPerPage}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {[5, 10, 20, 50].map(number => (
                                    <Dropdown.Item key={number} onClick={() => handleTicketsPerPageChange(number)}>
                                        {number}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                </div>


            )}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.875rem', color: '#333' }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the ticket?<p> #{ticketToDelete?.id + "-" + ticketToDelete?.title}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size='sm' onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" size='sm' onClick={() => handleDelete(ticketToDelete?.id)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <TicketViewModal
                show={showViewModal}
                onClose={() => setShowViewModal(false)}
                selectedTicket={selectedTicket}
                users={users}
                renderCategoryBadge={renderCategoryBadge}
                renderStatusBadge={renderStatusBadge}
                renderPriorityBadge={renderPriorityBadge}
                handleDownloadAttachment={handleDownloadAttachment}
                navigate={navigate}
                currentUser={currentUser}
                setShowViewModal={setShowViewModal}
                refreshTickets={handleRefresh}
            />
        </div>
    );
};

export default TicketsList;
