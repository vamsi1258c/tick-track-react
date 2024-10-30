import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { fetchTicket, updateTicket } from '../../services/ticket';
import { fetchUsers } from '../../services/authService';
import { uploadAttachment } from '../../services/attachment';
import { fetchComments, createComment } from '../../services/comment'; // New service imports for comments
import AttachmentsView from './AttachmentsView';
import RichTextEditor from './RichTextEditor';

const TicketEdit = ({ currentUserId }) => {
    const location = useLocation();
    const ticketId = location.state?.ticketId;

    const [ticketData, setTicketData] = useState({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        category: 'service',
        created_by: 0,
        assigned_to: 0,
    });

    const [showAttachments, setShowAttachments] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);

    // New state variables for comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const [userResponse, ticketResponse, commentsResponse] = await Promise.all([
                    fetchUsers(),
                    fetchTicket(ticketId),
                    fetchComments(ticketId) 
                ]);

                const userOptions = userResponse.data.map(user => ({ value: user.id, label: user.username }));
                setUsers(userOptions);
                setTicketData(ticketResponse.data);

                const assignee = ticketResponse.data.assignee?.username;
                const defaultUser = userOptions.find(user => user.label === assignee);
                setSelectedUser(defaultUser || null);
                setComments(commentsResponse.data);   
            } catch (error) {
                console.error(error);
                setError('Failed to fetch ticket, users, or comments.');
            } finally {
                setIsLoading(false);
              
            }
        };
        fetchAllData();
    }, [currentUserId, ticketId]);

    const handleChange = (e) => {
        setTicketData({
            ...ticketData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDescriptionChange = (content) => {
        setTicketData({ ...ticketData, description: content });
    };

    const handleAssignedToChange = (selectedOption) => {
        setSelectedUser(selectedOption);
        setTicketData((prevData) => ({
            ...prevData,
            assigned_to: selectedOption ? selectedOption.value : 0,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prevAttachments => [...prevAttachments, ...files]);
    };

    const removeFile = (index) => {
        setAttachments(prevAttachments =>
            prevAttachments.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updateData = {
            title: ticketData.title,
            description: ticketData.description,
            status: ticketData.status,
            priority: ticketData.priority,
            category: ticketData.category,
            assigned_to: ticketData.assigned_to,
        };
        try {
            // First, update the ticket
            const response = await updateTicket(ticketId, updateData);
            if (response.status === 200) {
                // If attachments are present, upload them
                if (attachments.length > 0) {
                    await Promise.all(attachments.map(async (attachment) => {
                        await uploadAttachment(ticketId, attachment);
                    }));
                }

                
                if (newComment.trim()) {
                    await createComment(ticketId, { content: newComment, ticket_id:ticketId, user_id:currentUserId });
                }

                setSuccess(true);
                navigate('/tickets');
            }
        } catch (error) {
            console.error(error);
            setError('Failed to update the ticket. Please try again.');
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
                    <Card className="my-4">
                        <Card.Body>
                            <h2 className="text-center">
                                Update Ticket  <span style={{ fontSize: '0.5em' }}> #{ticketData.id}</span>
                            </h2>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">Ticket updated successfully!</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formTitle" className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={ticketData.title}
                                        onChange={handleChange}
                                        placeholder="Enter ticket title"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    {/* <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={ticketData.description}
                                        onChange={handleChange}
                                        placeholder="Enter ticket description"
                                        required
                                    /> */}
                                    <RichTextEditor
                                        value={ticketData.description}
                                        onChange={handleDescriptionChange}
                                        placeholder="Enter ticket description"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formStatus" className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={ticketData.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formPriority" className="mb-3">
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Select
                                        name="priority"
                                        value={ticketData.priority}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formCategory" className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={ticketData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="service">Service</option>
                                        <option value="troubleshooting">Troubleshooting</option>
                                        <option value="maintenance">Maintenance</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formAssignedTo" className="mb-3">
                                    <Form.Label>Assigned To</Form.Label>
                                    <Select
                                        options={users}
                                        onChange={handleAssignedToChange}
                                        placeholder="Select a user"
                                        value={selectedUser}
                                        isSearchable
                                    />
                                </Form.Group>

                                <Form.Group controlId="formAttachments" className="mb-3">
                                    <Form.Control
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    {attachments.length > 0 && (
                                        <div className="mt-2">
                                            <ul>
                                                {attachments.map((file, index) => (
                                                    <li key={index} className="d-flex justify-content-between align-items-center">
                                                        {file.name}
                                                        <Button variant="link" onClick={() => removeFile(index)}>&times;</Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <Button variant="link" className="mt-3" onClick={() => setShowAttachments(true)}>
                                        View Uploaded
                                    </Button>
                                </Form.Group>

                                {/* Comments Section */}
                                <Form.Group controlId="formComments" className="mb-3">
                                    <Form.Label>Comments</Form.Label>
                                    
                                    {comments.length > 0 ? (
                                        <ul>
                                            {comments.map((comment) => ( 

                                                <li key={comment.id}>
                                                    <strong>{comment?.user?.username}:</strong> {comment.content}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No comments yet.</p>
                                    )}

                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="mt-3">
                                    Update Ticket
                                </Button>
                                <Button variant="secondary" className="mt-3 ms-2" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                            </Form>
                            <AttachmentsView
                                 ticketId={ticketId}
                                 show={showAttachments}
                                 handleClose={() => setShowAttachments(false)}
                             />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TicketEdit;