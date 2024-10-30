import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchActivityLogsByUserId, deleteActivityLog } from '../services/activityLog';
import { FaTrashAlt, FaTimes   } from 'react-icons/fa'; // Importing the delete icon from react-icons

const UserActivityLog = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate
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
            return "Date not available"; // Handle undefined or null dateString
        }

        // Remove microseconds if present and create a valid Date object
        const cleanedDateString = dateString.split('.')[0];
        const date = new Date(cleanedDateString);
        return isNaN(date.getTime()) ? "Date not available" : date.toLocaleString();
    };

    const handleDelete = async (logId) => {
        if (window.confirm("Are you sure you want to delete this activity log?")) {
            try {
                await deleteActivityLog(logId); // Call the delete API
                setActivityLogs(activityLogs.filter(log => log.id !== logId)); // Update state to remove the deleted log
            } catch (error) {
                setError("Failed to delete activity log");
            }
        }
    };

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // Inline styles
    const cardStyle = {
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
    };

    const buttonStyle = {
        padding: '8px 12px',
        fontSize: '14px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        minWidth: '100px',
        backgroundColor: '#6c757d', // Default button color
        color: 'white',
        marginTop: '20px', // Add margin for spacing
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>User Activity Log</h1>
            <div style={cardStyle}>
                {activityLogs.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {activityLogs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
                                    <td style={{ padding: '10px', flex: 1 }}>
                                        <p style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                                            <span>
                                                <strong>Action:</strong> {log.action}
                                            </span>
                                            <span style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}>
                                                <strong>Date:</strong> {formatDate(log.created_at)}
                                            </span>
                                            {log.ticket_id && (
                                                <span style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}>
                                                    <strong>Ticket ID:</strong> {log.ticket_id}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleDelete(log.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#e74c3c',
                                                    fontSize: '16px',
                                                    marginLeft: '10px'
                                                }}
                                                title="Delete Activity Log"
                                            >
                                                <FaTimes  />
                                            </button>
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No activity logs available.</p>
                )}
                {/* Move the Back button here to place it at the bottom of the card */}
                <button
                    onClick={handleBack}
                    style={buttonStyle}
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default UserActivityLog;
