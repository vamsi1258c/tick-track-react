import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Typography, CardContent, CardHeader } from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>{error}</Typography>;

    return (
        <div style={{ padding: '20px' }}>
            <Card sx={{ maxWidth: 800, margin: 'auto', mb: 4 }}>
                <CardHeader
                    title={<Typography variant="h5">User Profile</Typography>}
                />
                <CardContent>
                    {user && (
                        <div>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Username:</strong> {user.username}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Full Name:</strong> {user.fullname || "N/A"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Designation:</strong> {user.designation || "N/A"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Role:</strong> {user.role}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Tickets Created:</strong> {user.tickets_created.length}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Tickets Assigned:</strong> {user.tickets_assigned.length}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Tickets Approved:</strong> {user.tickets_approved.length}
                            </Typography>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                {user.role === 'admin' && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleEditProfile}
                                        startIcon={<EditIcon />}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleBack}
                                    startIcon={<ArrowBackIcon />}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>
                    )}
                    {isEditing && <Typography>Editing user details...</Typography>} {/* Optional editing message */}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;
