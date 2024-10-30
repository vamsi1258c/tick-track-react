import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { fetchTicket, createTicket, updateTicket } from '../../services/ticket';
import { fetchUsers } from '../../services/authService';
import { uploadAttachment } from '../../services/attachment';
import AttachmentsView from './AttachmentsView';

const TicketForm = ({ currentUser, isEditMode = false }) => {
    const location = useLocation();
    const ticketId = isEditMode ? location.state?.ticketId : null;  // Only get ticketId for edit mode
    const [ticketData, setTicketData] = useState({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        created_by: currentUser?.id || 0,
        assigned_to: 0,
    });
    const [users, setUsers] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [showAttachments, setShowAttachments] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);  // Only show loading spinner for edit
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsersAndTicket = async () => {
            try {
                const userResponse = await fetchUsers();
                const userOptions = userResponse.data.map(user => ({ value: user.id, label: user.username }));
                setUsers(userOptions);

                if (isEditMode && ticketId) {
                    const ticketResponse = await fetchTicket(ticketId);
                    setTicketData(ticketResponse.data);

                    // Set the default selected user for edit
                    const assignee = ticketResponse.data.assignee.username;
                    const defaultUser = userOptions.find(user => user.label === assignee);
                    setSelectedUser(defaultUser || null);
                }
            } catch (error) {
                console.error(error);
                setError('Failed to fetch users or ticket data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsersAndTicket();
    }, [isEditMode, ticketId]);

    const handleChange = (e) => {
        setTicketData({
            ...ticketData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAssignedToChange = (selectedOption) => {
        setSelectedUser(selectedOption);
        setTicketData(prevData => ({
            ...prevData,
            assigned_to: selectedOption ? selectedOption.value : 0,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = {
            title: ticketData.title,
            description: ticketData.description,
            status: ticketData.status,
            priority: ticketData.priority,
            assigned_to: ticketData.assigned_to,
        };

        try {
            let response;
            if (isEditMode) {
                response = await updateTicket(ticketId, submitData);
            } else {
                response = await createTicket(submitData);
            }

            if (response.status === 200 || response.status === 201) {
                // Upload attachments if present
                if (attachments.length > 0) {
                    const id = isEditMode ? ticketId : response.data.id;
                    await Promise.all(attachments.map(file => uploadAttachment(id, file)));
                }
                setSuccess(true);
                navigate('/tickets');
            }
        } catch (error) {
            console.error(error);
            setError('Failed to submit the ticket. Please try again.');
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

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col xs={12} md={8}>
                    <h2 className="my-4">{isEditMode ? 'Edit Ticket' : 'Create Ticket'}</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Ticket {isEditMode ? 'updated' : 'created'} successfully!</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* Title */}
                        <Form.Group controlId="formTitle" className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={ticketData.title}
                                onChange={handleChange}
                                placeholder="Enter ticket title"
                            />
                        </Form.Group>

                        {/* Description */}
                        <Form.Group controlId="formDescription" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={ticketData.description}
                                onChange={handleChange}
                                placeholder="Enter ticket description"
                            />
                        </Form.Group>

                        {/* Status (Only show for edit mode) */}
                        {isEditMode && (
                            <Form.Group controlId="formStatus" className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={ticketData.status} onChange={handleChange}>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </Form.Select>
                            </Form.Group>
                        )}

                        {/* Priority */}
                        <Form.Group controlId="formPriority" className="mb-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Select name="priority" value={ticketData.priority} onChange={handleChange}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Assigned To */}
                        <Form.Group controlId="formAssignedTo" className="mb-3">
                            <Form.Label>Assigned To</Form.Label>
                            <Select
                                options={users}
                                onChange={handleAssignedToChange}
                                value={selectedUser}
                                placeholder="Select a user"
                                isSearchable
                            />
                        </Form.Group>

                        {/* Attachments */}
                        <Form.Group controlId="formAttachments" className="mb-3">
                            <Form.Control type="file" multiple onChange={handleFileChange} />
                            {attachments.length > 0 && (
                                <ul>
                                    {attachments.map((file, index) => (
                                        <li key={index} className="d-flex justify-content-between align-items-center">
                                            {file.name}
                                            <Button variant="link" onClick={() => removeFile(index)}>&times;</Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Form.Group>

                        {/* Submit and Back Buttons */}
                        <Button variant="primary" type="submit" className="mt-3">
                            {isEditMode ? 'Update Ticket' : 'Create Ticket'}
                        </Button>
                        <Button variant="secondary" className="mt-3" onClick={() => navigate(-1)}>Back</Button>
                    </Form>

                    {/* Attachments Modal */}
                    <AttachmentsView
                        ticketId={ticketId}
                        show={showAttachments}
                        handleClose={() => setShowAttachments(false)}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default TicketForm;
