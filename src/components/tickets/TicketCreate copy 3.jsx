import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { createTicket } from '../../services/ticket';
import { uploadAttachment } from '../../services/attachment';
import { fetchUsers } from '../../services/authService';
import RichTextEditor from './RichTextEditor';

const TicketCreate = ({ currentUser }) => {
    const [ticketData, setTicketData] = useState({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        category: 'service',
        subcategory: ' ',  
        created_by: 0,
        assigned_to: 0,
    });

    const [attachments, setAttachments] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [subcategories, setSubcategories] = useState([]);  
    const navigate = useNavigate();

    

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await fetchUsers();
                setUsers(response.data.map(user => ({ value: user.id, label: user.username })));

                const currentUserId = response.data.find(user => user.username === currentUser)?.id;
                setTicketData(prevData => ({
                    ...prevData,
                    created_by: currentUserId,
                }));
            } catch (error) {
                setError('Failed to fetch users.');
            }
        };

        fetchAllUsers();
         
    }, [currentUser]);

    useEffect(() => {
        // Set initial subcategories based on the default category
        const initialSubcategories = getSubcategories(ticketData.category);
        setSubcategories(initialSubcategories);
    }, [ticketData.category]); // Runs only once on component mount

    // Handle category change to update subcategories
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setTicketData(prevData => ({
            ...prevData,
            category: selectedCategory,
            subcategory: '', 
        }));
        setSubcategories(getSubcategories(selectedCategory)); 
    };

    // Function to get subcategories based on selected category
    const getSubcategories = (category) => {
        switch (category) {
            case 'service':
                return [
                    { value: 'technical_support', label: 'Technical Support' },
                    { value: 'customer_service', label: 'Customer Service' },
                ];
            case 'troubleshooting':
                return [
                    { value: 'software_issue', label: 'Software Issue' },
                    { value: 'hardware_issue', label: 'Hardware Issue' },
                ];
            case 'maintenance':
                return [
                    { value: 'scheduled', label: 'Scheduled Maintenance' },
                    { value: 'unscheduled', label: 'Unscheduled Maintenance' },
                ];
            default:
                return [];
        }
    };

    

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
        setTicketData({
            ...ticketData,
            assigned_to: selectedOption ? selectedOption.value : 0,
        });
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
        try {
            const response = await createTicket(ticketData);
            if (response.status === 201) {
                const ticketId = response.data.id;
                setSuccess(true);

                await Promise.all(attachments.map(async (attachment) => {
                    await uploadAttachment(ticketId, attachment);
                }));

                navigate('/tickets');
            }
        } catch (error) {
            setError('Failed to create the ticket. Please try again.');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col xs={12} md={8}>
                    <Card className="p-4 shadow-sm">
                        <Card.Body>
                            <h3 className="mb-4 text-center">Create New Ticket</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">Ticket created successfully!</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formTitle" className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={ticketData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter ticket title"
                                    />
                                </Form.Group>

                                <Form.Group controlId="formDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
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
                                        disabled
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
                                        onChange={handleCategoryChange} // Use new handler
                                    >
                                        <option value="service">Service</option>
                                        <option value="troubleshooting">Troubleshooting</option>
                                        <option value="maintenance">Maintenance</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formSubcategory" className="mb-3">
                                    <Form.Label>Subcategory</Form.Label>
                                    <Form.Select
                                        name="subcategory"
                                        value={ticketData.subcategory}
                                        onChange={handleChange}
                                        // disabled={!ticketData.category} // Disable until a category is selected
                                    >
                                        <option value="">Select a subcategory</option>
                                        {subcategories.map(sub => (
                                            <option key={sub.value} value={sub.value}>
                                                {sub.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formAssignedTo" className="mb-3">
                                    <Form.Label>Assigned To</Form.Label>
                                    <Select
                                        options={users}
                                        onChange={handleAssignedToChange}
                                        placeholder="Select a user"
                                        isSearchable
                                    />
                                </Form.Group>

                                <Form.Group controlId="formAttachments" className="mb-3">
                                    <Form.Label>Attachments</Form.Label>
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
                                                        <Button variant="link" size="sm" onClick={() => removeFile(index)}>&times;</Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </Form.Group>

                                <Button variant="primary" type="submit" className="mt-3">
                                    Create Ticket
                                </Button>
                                <Button variant="secondary" className="mt-3 ms-2" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TicketCreate;
