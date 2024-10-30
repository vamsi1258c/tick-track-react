import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
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

    // Inline styles
    const cardStyle = {
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '10px',
        marginTop: '10px',
    };


    return (
        <div style={{ padding: '20px' }}>
            <h3>User Profile</h3>
            {user && (
                <div style={cardStyle}>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Full Name:</strong> {user.fullname || "N/A"}</p>
                    <p><strong>Designation:</strong> {user.designation || "N/A"}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Tickets Created:</strong> {user.tickets_created.length}</p>
                    <p><strong>Tickets Assigned:</strong> {user.tickets_assigned.length}</p>
                    <p><strong>Tickets Approved:</strong> {user.tickets_approved.length}</p>
                    <div className='mt-4'>
                        {user.role === 'admin' && ( // Show edit button if user is admin
                            <Button variant="primary" className="me-3" size="sm"
                                onClick={handleEditProfile}
                            >
                                Edit Profile
                            </Button>
                        )}
                        <Button variant="secondary" size="sm"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                    </div>
                </div>
            )}
            {isEditing && <p>Editing user details...</p>} {/* Optional editing message */}
        </div>
    );
};

export default UserProfile;
