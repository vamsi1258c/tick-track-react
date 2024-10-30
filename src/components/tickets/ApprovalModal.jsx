import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const ApprovalModal = ({ show, onClose, onSubmit, approvers, loading }) => {
    const [selectedApprover, setSelectedApprover] = useState(null);

    const handleApproverChange = (e) => {
        setSelectedApprover(e.target.value);
    };

    const handleSubmit = () => {
        if (selectedApprover) {
            onSubmit(selectedApprover);
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Select Approver</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <Form>
                        <Form.Group controlId="approverSelect">
                            <Form.Label>Select an approver:</Form.Label>
                            <Form.Control as="select" value={selectedApprover || ''} onChange={handleApproverChange}>
                                <option value="" disabled>Select Approver</option>
                                {approvers.map((approver) => (
                                    <option key={approver.id} value={approver.id}>
                                        {approver.fullname} ({approver.username})
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!selectedApprover}>
                    Submit for Approval
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ApprovalModal;
