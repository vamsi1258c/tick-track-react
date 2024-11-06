import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchActivityLogsByUserId, deleteActivityLog } from '../services/activityLog';
import { FaTimes } from 'react-icons/fa';
import { Card, Button } from 'react-bootstrap';

const UserActivityLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                const response = await fetchActivityLogsByUserId(id);
                setActivityLogs(response.data);
                setLoading(false);
            } catch (error) {
                setError("No activity logs available.");
                setLoading(false);
            }
        };

        fetchActivityLogs();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) {
            return "Date not available";
        }

        const cleanedDateString = dateString.split('.')[0];
        const date = new Date(cleanedDateString);
        return isNaN(date.getTime()) ? "Date not available" : date.toLocaleString();
    };

    const handleDelete = async (logId) => {
        if (window.confirm("Are you sure you want to delete this activity log?")) {
            try {
                await deleteActivityLog(logId);
                setActivityLogs(activityLogs.filter(log => log.id !== logId));
            } catch (error) {
                setError("Failed to delete activity log");
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <Card className="mb-4" style={{ maxWidth: '600px', margin: 'auto' }}>
                <Card.Header>
                    <h3>Your Activity</h3>
                </Card.Header>
                <Card.Body>
                    {activityLogs.length > 0 ? (
                        <div>
                            {activityLogs.map((log) => (
                                <Card key={log.id} className="mb-3" style={{ position: 'relative' }}>
                                    <Card.Body>
                                        <Button
                                            variant="link"
                                            onClick={() => handleDelete(log.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                width: '16px',
                                                height: '16px',
                                                padding: '0',
                                                fontSize: '14px',
                                                color: '#e74c3c',
                                                background: 'none',
                                                border: '1px solid #e74c3c',
                                                borderRadius: '0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'color 0.3s ease',
                                            }}
                                            title="Delete Activity Log"
                                        >
                                            <FaTimes style={{ fontSize: '16px' }} />
                                        </Button>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <p><strong>Action:</strong> {log.action}</p>
                                            <p><strong>Date:</strong> {formatDate(log.created_at)}</p>
                                            {log.ticket_id && (
                                                <p><strong>Ticket ID:</strong> {log.ticket_id}</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p>No activity logs available.</p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                        <Button
                            variant="secondary"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default UserActivityLog;
