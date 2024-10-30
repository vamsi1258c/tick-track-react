import React, { useState, useEffect } from 'react';
import { Modal, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { fetchAttachments, deleteAttachment, downloadAttachment } from '../../services/attachment'; // Import the download function
import { BsTrash } from 'react-icons/bs'; 
import { FaDownload } from 'react-icons/fa';
import './AttachmentsView.css'; 

const AttachmentsView = ({ ticketId, show, handleClose }) => {
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAttachments = async () => {
            if (show) {
                try {
                    setIsLoading(true);
                    const response = await fetchAttachments(ticketId);
                    setAttachments(response.data);
                } catch (err) {
                    setError('Failed to fetch attachments.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadAttachments();
    }, [ticketId, show]);

    const handleDelete = async (attachmentId) => {
        if (window.confirm("Are you sure you want to delete this attachment?")) {
            try {
                await deleteAttachment(ticketId, attachmentId);
                setAttachments(attachments.filter(att => att.id !== attachmentId));
            } catch (err) {
                alert("Failed to delete attachment. Please try again.");
            }
        }
    };

    const handleDownload = async (attachmentId) => {
        try {
            await downloadAttachment(ticketId, attachmentId); 
        } catch (err) {
            alert("Failed to download attachment. Please try again.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Attachments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : attachments.length === 0 ? (
                    <p>No attachments found for this ticket.</p>
                ) : (
                    <ListGroup variant="flush">
                        {attachments.map((attachment, index) => (
                            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                <div 
                                    onClick={() => handleDownload(attachment.id)} 
                                    className="attachment-link"
                                >
                                    <strong> <FaDownload />{attachment.filename}</strong>
                                    <br />
                                    <small className="text-muted">Uploaded: {new Date(attachment.uploaded_at).toLocaleString()}</small>
                                </div>
                                <BsTrash
                                    role="button"
                                    size={20}
                                    onClick={() => handleDelete(attachment.id)}
                                    style={{ color: 'red', cursor: 'pointer' }}
                                    title="Delete attachment"
                                />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={handleClose}>
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default AttachmentsView;
