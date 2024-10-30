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
        subcategory: '',  
        created_by: 0,
        assigned_to: 0,
    });

    const [attachments, setAttachments] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [subcategories, setSubcategories] = useState([]);
    const [validationErrors, setValidationErrors] = useState({
        title: '',
        description: '',
        priority: '',
        category: '',
    });
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
        setSubcategories(getSubcategories(ticketData.category));
    }, [ticketData.category]);

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setTicketData(prevData => ({
            ...prevData,
            category: selectedCategory,
            subcategory: '', 
        }));
        setSubcategories(getSubcategories(selectedCategory)); 
    };

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
        const { name, value } = e.target;
        setTicketData({
            ...ticketData,
            [name]: value,
        });

        // Clear validation error for the current field
        setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '', // Reset the specific error message
        }));
    };

    const handleDescriptionChange = (content) => {
        setTicketData({ ...ticketData, description: content });

        // Clear validation error for the description field
        setValidationErrors((prevErrors) => ({
            ...prevErrors,
            description: '', // Reset the description error message
        }));
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

    const validateFields = (field) => {
        const errors = {};
        if (field ==='title' && !ticketData.title) {
            errors.title = 'Title is required.';
        }
        if (field ==='description' &&!ticketData.description) {
            errors.description = 'Description is required.';
        }
        if (field ==='property' && !ticketData.priority) {
            errors.priority = 'Priority is required.';
        }
        if (field ==='category' &&!ticketData.category) {
            errors.category = 'Category is required.';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (field) => {
        validateFields(field);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateFields()) return; // Prevent submission if there are validation errors

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
                                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={ticketData.title}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('title')}
                                        required
                                        placeholder="Enter ticket title"
                                        size="sm"
                                    />
                                    {validationErrors.title && <div className="text-danger">{validationErrors.title}</div>}
                                </Form.Group>

                                <Form.Group controlId="formDescription" className="mb-3">
                                    <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                                    <RichTextEditor
                                        value={ticketData.description}
                                        onChange={handleDescriptionChange}
                                        onBlur={() => handleBlur('description')}
                                        placeholder="Enter ticket description"
                                    />
                                    {validationErrors.description && <div className="text-danger">{validationErrors.description}</div>}
                                </Form.Group>

                                <Form.Group controlId="formStatus" className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={ticketData.status}
                                        onChange={handleChange}
                                        disabled
                                        size="sm"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="formPriority" className="mb-3">
                                    <Form.Label>Priority <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="priority"
                                        value={ticketData.priority}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('priority')}
                                        size="sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </Form.Select>
                                    {validationErrors.priority && <div className="text-danger">{validationErrors.priority}</div>}
                                </Form.Group>

                                <Form.Group controlId="formCategory" className="mb-3">
                                    <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={ticketData.category}
                                        onChange={handleCategoryChange}
                                        onBlur={() => handleBlur('category')}
                                        size="sm"
                                    >
                                        <option value="service">Service</option>
                                        <option value="troubleshooting">Troubleshooting</option>
                                        <option value="maintenance">Maintenance</option>
                                    </Form.Select>
                                    {validationErrors.category && <div className="text-danger">{validationErrors.category}</div>}
                                </Form.Group>

                                <Form.Group controlId="formSubcategory" className="mb-3">
                                    <Form.Label>Subcategory</Form.Label>
                                    <Form.Select
                                        name="subcategory"
                                        value={ticketData.subcategory}
                                        onChange={handleChange}
                                        size="sm"
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
                                        isClearable
                                        className='custom-select'
                                    />
                                </Form.Group>

                                <Form.Group controlId="formAttachments" className="mb-3">
                                    <Form.Label>Attachments</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleFileChange}
                                        multiple
                                        size="sm"
                                    />
                                    {attachments.length > 0 && (
                                        <div className="mt-2">
                                            {attachments.map((file, index) => (
                                                <div key={index} className="d-flex justify-content-between">
                                                    <span>{file.name}</span>
                                                    <Button variant="link" onClick={() => removeFile(index)}>Remove</Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>

                                <Button variant="primary" type="submit" size="sm">Create Ticket</Button>
                                <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)} size="sm">
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
