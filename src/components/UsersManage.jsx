import React, { useEffect, useState, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Modal, Button, TextField, CircularProgress, Box, Typography,
    IconButton, Paper, Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add, Refresh, Close } from '@mui/icons-material';
import { fetchUsers, deleteUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { CustomPagination } from './Pagination';
import { UserDetails } from './UserDetails';
import { useSnackbar } from './Snackbar';

const UsersManage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetchUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users.');
            showSnackbar('Failed to load users.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleDeleteModalOpen = (userId) => {
        setUserIdToDelete(userId);
        setShowDeleteModal(true);
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
        setUserIdToDelete(null);
    };

    const confirmDelete = async () => {
        try {
            await deleteUser(userIdToDelete);
            setUsers(users.filter(user => user.id !== userIdToDelete));
        } catch (err) {
            setError(`User ${userIdToDelete} cannot be deleted.`);
            showSnackbar(`User ${userIdToDelete} cannot be deleted.`, 'error');
        }
        handleDeleteModalClose();
    };

    const handleEdit = (user) => {
        navigate(`/signup`, { state: { user } });
    };

    const handleAddUser = () => {
        navigate('/signup');
    };

    const handleRefresh = () => {
        loadUsers();
        setError('');
    };

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase().trim();
        return user.username.toLowerCase().includes(term) || user.fullname.toLowerCase().includes(term);
    });

    const sortUsers = (users) => {
        return [...users].sort((a, b) => {
            const aValue = a[sortKey] ?? '';
            const bValue = b[sortKey] ?? '';

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue);
            const bString = String(bValue);

            return sortDirection === 'asc'
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    };

    const headerMap = {
        'ID': 'id',
        'Full Name': 'fullname',
        'Email': 'username',
        'Role': 'role'
    };

    const handleSort = (key) => {
        const mappedKey = headerMap[key] || key;
        const newDirection = sortKey === mappedKey && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortKey(mappedKey);
        setSortDirection(newDirection);
    };

    const sortedUsers = sortUsers(filteredUsers);
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const currentUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" color="primary" fontWeight='bold'>Manage Users</Typography>
                <Box>
                    <Button variant="outlined" onClick={handleRefresh} sx={{ mr: 1 }}>
                        <Refresh /> Refresh
                    </Button>
                    <Button variant="contained" onClick={handleAddUser}>
                        <Add /> Add
                    </Button>
                </Box>
            </Box>

            <TextField
                variant="outlined"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                    endAdornment: searchTerm && (
                        <IconButton onClick={() => setSearchTerm('')}>
                            <Close />
                        </IconButton>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            {isLoading ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {error && <Typography color="error" textAlign="center">{error}</Typography>}
                    <TableContainer component={Paper} sx={{ padding: 0, margin: 0 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {Object.keys(headerMap).map((header) => (
                                        <TableCell
                                            key={header}
                                            onClick={() => handleSort(headerMap[header])}
                                            sx={{
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                padding: '3px' , 
                                                paddingLeft: '16px'
                                            }}
                                        >
                                            {header}
                                            {sortKey === headerMap[header] && (
                                                sortDirection === 'asc' ? ' ↑' : ' ↓'
                                            )}
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ padding: '3px', paddingLeft: '16px' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {currentUsers.map(user => (
                                    <TableRow hover key={user.id} onClick={() => handleRowClick(user)} sx={{ height: '40px' }}>  {/* Reduced row height */}
                                        <TableCell sx={{ padding: '3px', paddingLeft: '16px'}}>{user.id}</TableCell>
                                        <TableCell sx={{ padding: '3px', paddingLeft: '16px' }}>{user.fullname}</TableCell>
                                        <TableCell sx={{ padding: '3px', paddingLeft: '16px' }}>{user.username}</TableCell>
                                        <TableCell sx={{ padding: '3px', paddingLeft: '16px' }}>{user.role}</TableCell>
                                        <TableCell sx={{ padding: '3px', paddingLeft: '16px'}}>
                                            <Tooltip title="Edit">
                                                <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(user); }} sx={{ padding: '4px' }}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteModalOpen(user.id); }} sx={{ padding: '4px' }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>


                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />

                    <UserDetails
                        showModal={showModal}
                        selectedUser={selectedUser}
                        handleClose={handleClose}
                    />

                    <Modal open={showDeleteModal} onClose={handleDeleteModalClose}>
                        <Box sx={{ p: 4, bgcolor: 'background.paper', mx: 'auto', my: '20%', maxWidth: 400 }}>
                            <Typography variant="h6">Confirm Deletion</Typography>
                            <Typography>Are you sure you want to delete this user?</Typography>
                            <Box mt={2} display="flex" justifyContent="flex-end">
                                <Button onClick={handleDeleteModalClose} sx={{ mr: 2 }}>Cancel</Button>
                                <Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>
                            </Box>
                        </Box>
                    </Modal>
                </>
            )}
        </Box>
    );
};

export default UsersManage;
