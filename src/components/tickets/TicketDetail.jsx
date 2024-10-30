import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import DOMPurify from 'dompurify';
import { FaDownload } from 'react-icons/fa';
import ApprovalModal from './ApprovalModal';
import { updateTicket } from '../../services/ticket';

const TicketViewModal = ({
    show,
    onClose,
    selectedTicket,
    users,
    renderCategoryBadge,
    renderStatusBadge,
    renderPriorityBadge,
    handleDownloadAttachment,
    navigate,
    currentUser,
    setShowViewModal,
    refreshTickets
}) => {

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [loadingApprovers, setLoadingApprovers] = useState(false);

    
    const handleSendForApproval = () => {
        setLoadingApprovers(true);
        console.log(selectedTicket);
        console.log(currentUser);
        try {
            setShowApprovalModal(true);
        } catch (error) {
            console.error("Failed to filter approvers", error);
        } finally {
            setLoadingApprovers(false);
        }
    };

    const handleApprovalSubmit = async (approverId) => {
        try {
            await updateTicket(selectedTicket.id, { status: 'to_be_approved', approved_by: approverId },);
            setShowApprovalModal(false);
            setShowViewModal(false);
            refreshTickets();
            selectedTicket.status = 'to_be_approved';
            selectedTicket.approved_by = approverId;
            alert("Ticket sent for approval successfully!");
        } catch (error) {
            console.error("Failed to send ticket for approval", error);
            alert("Failed to send for approval. Please try again.");
        }
    };

    const handleApproval = async (approverId) => {
        try {
            await updateTicket(selectedTicket.id, { status: 'in_progress' });
            selectedTicket.status = 'in_progress';
            alert("Ticket has been approved!");
            setShowViewModal(false);
            refreshTickets();
        } catch (error) {
            alert("Failed to to approve. Please try again. "+error);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onClose} size="lg">
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button variant="close" onClick={onClose} />
                </div>
                <h3 className="view-modal-title" >
                    Review Ticket# {selectedTicket?.id}
                </h3>
                <Modal.Header>
                    <Modal.Title>
                        <div>{selectedTicket?.title}</div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Description:</strong> <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTicket?.description || '') }} /></p>
                    <p><strong>Category:</strong> {renderCategoryBadge(selectedTicket?.category)}</p>
                    <p><strong>Status:</strong> {renderStatusBadge(selectedTicket?.status)}</p>
                    <p><strong>Priority:</strong> {renderPriorityBadge(selectedTicket?.priority)}</p>
                    <p><strong>Creator:</strong> {selectedTicket?.creator?.username}</p>
                    <p><strong>Assignee:</strong> {selectedTicket?.assignee?.username}</p>
                    {selectedTicket?.approver && (<p><strong>Approver:</strong> {selectedTicket?.approver?.username}</p>)}
                    <p><strong>Created:</strong> {new Date(selectedTicket?.created_at).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(selectedTicket?.updated_at).toLocaleString()}</p>

                    <hr />

                    <h5>Comments:</h5>
                    {selectedTicket?.comments.length > 0 ? (
                        selectedTicket.comments.map((comment) => (
                            <div key={comment.id}>
                                <p style={{ fontSize: '0.75rem' }}>{users.find(user => user.id === comment?.user_id)?.fullname || 'Unknown User'}: {comment.content}, at {new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.75rem' }}>No comments available.</p>
                    )}

                    <hr />

                    <h5>Activity Logs:</h5>
                    {selectedTicket?.activity_logs.length > 0 ? (
                        selectedTicket.activity_logs.map((log) => (
                            <div key={log.id}>
                                <p style={{ fontSize: '0.75rem' }}><strong>{users.find(user => user.id === log.user_id)?.fullname || 'Unknown User'}</strong> {log.action}, at {new Date(log.created_at).toLocaleString()}</p>
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
                                <p style={{ fontSize: '0.75rem' }}>
                                    <button
                                        onClick={() => handleDownloadAttachment(selectedTicket.id, attachment.id)}
                                        className="attachment-button"
                                    >
                                        <FaDownload style={{ marginRight: '5px' }} />
                                        {attachment.filename}
                                    </button>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.75rem' }}>No attachments available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size='sm' onClick={onClose}>
                        Back
                    </Button>
                    <Button variant="primary" size='sm' onClick={() => navigate('/edit-ticket', { state: { ticketId: selectedTicket.id } })}>
                        Edit Ticket
                    </Button>
                    {!selectedTicket?.approver && ['open', 'in_progress'].includes(selectedTicket?.status) && (
                        <Button variant="primary" size='sm' onClick={handleSendForApproval}>
                            Send for Approval
                        </Button>
                    )}
                    {selectedTicket?.status === 'to_be_approved' && selectedTicket?.approver?.username === currentUser && (
                        <Button variant="primary" size='sm' onClick={handleApproval}>
                            Approve
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            <ApprovalModal
                show={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                onSubmit={handleApprovalSubmit}
                approvers={users.filter((user) => user.approver === true)}
                loading={loadingApprovers}
            />
        </>
    );
};

export default TicketViewModal;
