import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import api from '../services/api';

const UserProfile = () => {
    const { id } = useParams(); // Get the user ID from the URL
    const navigate = useNavigate(); // Initialize useNavigate
    const location = useLocation(); // Get the current location
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/${id}`);
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                setError("Failed to fetch user details");
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    const handleEditProfile = () => {
        navigate('/signup', { state: { user } }); // Navigate to /signup with user state
    };

    const isEditing = location.state && location.state.user; // Check if editing

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <Card className="mb-4" style={{ maxWidth: '800px', margin: 'auto' }}>
                <Card.Header>
                    <h3>User Profile</h3>
                </Card.Header>
                <Card.Body>
                    {user && (
                        <div>
                            <div className="mb-3">
                                <strong>Username:</strong> {user.username}
                            </div>
                            <div className="mb-3">
                                <strong>Full Name:</strong> {user.fullname || "N/A"}
                            </div>
                            <div className="mb-3">
                                <strong>Designation:</strong> {user.designation || "N/A"}
                            </div>
                            <div className="mb-3">
                                <strong>Role:</strong> {user.role}
                            </div>
                            <div className="mb-3">
                                <strong>Tickets Created:</strong> {user.tickets_created.length}
                            </div>
                            <div className="mb-3">
                                <strong>Tickets Assigned:</strong> {user.tickets_assigned.length}
                            </div>
                            <div className="mb-3">
                                <strong>Tickets Approved:</strong> {user.tickets_approved.length}
                            </div>

                            <div className="d-flex justify-content-start gap-3 mt-4">
                                {user.role === 'admin' && (
                                    <Button variant="primary" size="sm" onClick={handleEditProfile}>
                                        Edit Profile
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm" onClick={handleBack}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    )}
                    {isEditing && <p>Editing user details...</p>} {/* Optional editing message */}
                </Card.Body>
            </Card>
        </div>
    );
};

export default UserProfile;
