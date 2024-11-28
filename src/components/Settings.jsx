import React, { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem, Button, Typography, Snackbar, Table, TableSortLabel, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Alert, IconButton } from '@mui/material';
import { fetchConfigMaster, createConfigMaster, updateConfigMaster, deleteConfigMaster } from '../services/configMaster';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';

const ConfigMasterMaintenance = () => {
    const [configEntries, setConfigEntries] = useState([]);
    const [newConfigData, setNewConfigData] = useState({
        type: '',
        value: '',
        label: '',
        color: '',
        parent: ''
    });
    const [editRowIndex, setEditRowIndex] = useState(null);
    const [configData, setConfigData] = useState({
        type: '',
        value: '',
        label: '',
        color: '',
        parent: ''
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    // const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [configToDelete, setConfigToDelete] = useState(null);
    const [categoryOptions, setcategoryOptions] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [filterLabel, setFilterLabel] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortField, setSortField] = useState('type');


    useEffect(() => {
        const getConfigEntries = async () => {
            try {
                const response = await fetchConfigMaster();
                setConfigEntries(response.data);
            } catch (error) {
                console.error('Error fetching configuration entries:', error);
            }
        };
        getConfigEntries();
        const getCategoryOptions = async () => {
            const categoryData = configEntries
                .filter(config => config.type === 'category')
                .map((config) => ({ label: config.label, value: config.value || config.id }));
            setcategoryOptions(categoryData);
        }
        getCategoryOptions();
    }, [configEntries]);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        if (name === 'filterType') {
            setFilterType(value);
            setFilterLabel('');

        } else if (name === 'filterLabel') {
            setFilterLabel(value);
        }
    };


    const handleInputChange = (event, index, isNewConfig) => {
        const { name, value } = event.target;

        if (isNewConfig) {
            setNewConfigData({
                ...newConfigData,
                [name]: value,
            });
        } else {
            setConfigData({
                ...configData,
                [name]: value,
            });
        }
    };

    const handleEdit = (index) => {
        setEditRowIndex(index);
        const entryToEdit = filteredData[index];
        setConfigData({
            type: entryToEdit.type,
            value: entryToEdit.value,
            label: entryToEdit.label,
            color: entryToEdit.color,
            parent: entryToEdit.parent,
            id: entryToEdit.id,
        });
    };

    const handleSave = async () => {
        try {
            if (editRowIndex === null) return;

            const entryIndex = configEntries.findIndex(item => item.id === configData.id);
            if (entryIndex === -1) {
                setSnackbarMessage('Configuration not found');
                setOpenSnackbar(true);
                return;
            }
            const updateData = {
                type: configData.type,
                value: configData.value,
                label: configData.label,
                color: configData.color,
                parent: configData.parent,
            };

            await updateConfigMaster(configData.id, updateData);

            const updatedConfigEntries = [...configEntries];
            updatedConfigEntries[entryIndex] = { ...updatedConfigEntries[entryIndex], ...updateData };

            setConfigEntries(updatedConfigEntries);
            setEditRowIndex(null);
            setSnackbarMessage('Configuration updated successfully');
            setOpenSnackbar(true);
        } catch (error) {
            setSnackbarMessage('Error while saving configuration');
            setOpenSnackbar(true);
        }
    };


    const handleCancelEdit = () => {
        setEditRowIndex(null);
        setConfigData({
            type: '',
            value: '',
            label: '',
            color: '',
            parent: ''
        });
    };


    const handleCreateNew = async () => {
        try {
            await createConfigMaster(newConfigData);
            setSnackbarMessage('Configuration created successfully');
            setOpenSnackbar(true);
            setNewConfigData({ type: '', value: '', label: '', color: '', parent: '' });

            const response = await fetchConfigMaster();
            setConfigEntries(response.data);

        } catch (error) {
            setSnackbarMessage('Error while saving configuration');
            setOpenSnackbar(true);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteConfigMaster(configToDelete.id);
            setSnackbarMessage('Configuration deleted successfully');
            setOpenSnackbar(true);
            setConfigEntries(configEntries.filter(config => config.id !== configToDelete.id));
            setOpenDeleteDialog(false);
        } catch (error) {
            setSnackbarMessage('Error while deleting configuration');
            setOpenSnackbar(true);
            setOpenDeleteDialog(false);
        }
    };

    const filteredData = configEntries
        .filter(entry =>
            (filterType ? entry.type.toLowerCase().includes(filterType.toLowerCase()) : true) &&
            (filterLabel ? entry.label.toLowerCase().includes(filterLabel.toLowerCase()) : true)
        )
        .sort((a, b) => {
            if (sortField === 'type') {
                return sortOrder === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
            }
            if (sortField === 'label') {
                return sortOrder === 'asc' ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
            }
            if (sortField === 'value') {
                return sortOrder === 'asc' ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value);
            }
            return 0;
        });

    const filteredEntries = filterType
        ? configEntries.filter((entry) => entry.type === filterType)
        : configEntries;

    
        const handleSort = (field) => {
            const isAsc = sortField === field && sortOrder === 'asc';
            setSortOrder(isAsc ? 'desc' : 'asc');
            setSortField(field);
        };
        
        const sortedData = [...filteredData].sort((a, b) => {
            const orderMultiplier = sortOrder === 'asc' ? 1 : -1;
            if (a[sortField] < b[sortField]) return -1 * orderMultiplier;
            if (a[sortField] > b[sortField]) return 1 * orderMultiplier;
            return 0;
        });
        


    return (
        <Box sx={{ padding: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                App Configurations
            </Typography>

            {/* Filter Section */}
            <Box sx={{ display: 'flex', marginBottom: 2, marginTop: 2, gap: 2 }}>
                <Select
                    name="filterType"
                    value={filterType}
                    onChange={handleFilterChange}
                    size="small"
                    displayEmpty
                    marginRight='20px'
                    sx={{
                        minWidth: 150,
                        borderColor: 'primary.light',
                        '& .MuiSelect-root': { paddingLeft: 2 },
                    }}
                >
                    <MenuItem value="">All Types</MenuItem>
                    {[...new Set(configEntries.map((entry) => entry.type))].map((type, index) => (
                        <MenuItem key={index} value={type}>
                            {type}
                        </MenuItem>
                    ))}
                </Select>

                {/* Dropdown Filter for Label */}
                <Select
                    name="filterLabel"
                    value={filterLabel}
                    onChange={handleFilterChange}
                    size="small"
                    displayEmpty
                    sx={{
                        minWidth: 150,
                        borderColor: 'primary.light',
                        '& .MuiSelect-root': { paddingLeft: 2 },
                    }}
                >
                    <MenuItem value="">All Labels</MenuItem>
                    {[...new Set(filteredEntries.map((entry) => entry.label))].map((label, index) => (
                        <MenuItem key={index} value={label}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            {/* Existing Configurations Table */}
            <Box sx={{ marginBottom: 3 }}>
                <TableContainer component={Paper} elevation={2}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.light', opacity: 0.85 }}>
                                <TableCell sx={{ fontWeight: 'bold', padding: '8px', color: 'white', width: '10%' }}>
                                    <TableSortLabel
                                        active={sortField === 'type'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('type')}
                                    >
                                        Type
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', padding: '8px', color: 'white', width: '15%' }}>
                                    <TableSortLabel
                                        active={sortField === 'label'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('label')}
                                    >
                                        Label
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', padding: '8px', color: 'white', width: '15%' }}>
                                    <TableSortLabel
                                        active={sortField === 'value'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('value')}
                                    >
                                        Value
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', padding: '8px', color: 'white', width: '10%' }}>
                                    <TableSortLabel
                                        active={sortField === 'color'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('color')}
                                    >
                                        Color
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', padding: '8px', color: 'white', width: '10%' }}>
                                    <TableSortLabel
                                        active={sortField === 'parent'}
                                        direction={sortOrder}
                                        onClick={() => handleSort('parent')}
                                    >
                                        Parent
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', padding: '8px', color: 'white', width: '15%' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>


                        <TableBody>
                            {/* Empty row for new configuration */}
                            <TableRow>
                                <TableCell sx={{ padding: '4px' }}>
                                    <TextField
                                        fullWidth
                                        name="type"
                                        value={newConfigData.type}
                                        onChange={(e) => handleInputChange(e, null, true)}
                                        placeholder="New Type"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '4px' }}>
                                    <TextField
                                        fullWidth
                                        name="label"
                                        value={newConfigData.label}
                                        onChange={(e) => handleInputChange(e, null, true)}
                                        placeholder="New Label"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '4px' }}>
                                    <TextField
                                        fullWidth
                                        name="value"
                                        value={newConfigData.value}
                                        onChange={(e) => handleInputChange(e, null, true)}
                                        placeholder="New Value"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '4px' }}>
                                    <TextField
                                        fullWidth
                                        name="color"
                                        value={newConfigData.color}
                                        onChange={(e) => handleInputChange(e, null, true)}
                                        placeholder="New Color"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ padding: '4px' }}>
                                    {newConfigData.type === 'subcategory' ? (
                                        <Select
                                            fullWidth
                                            name="parent"
                                            value={newConfigData.category}
                                            onChange={(e) => handleInputChange(e, null, true)}
                                            size="small"
                                            placeholder="Select Category"
                                        >
                                            <MenuItem value="" disabled>
                                                Select Category
                                            </MenuItem>
                                            {categoryOptions.map(sub => (
                                                <MenuItem key={sub.value} value={sub.value}>{sub.label}</MenuItem>
                                            ))}
                                        </Select>
                                    ) : 'NA'}
                                </TableCell>
                                <TableCell sx={{ padding: '4px' }}>
                                    <IconButton
                                        color="primary"
                                        onClick={handleCreateNew}
                                        disabled={!newConfigData.type || !newConfigData.value || !newConfigData.label}
                                        sx={{ fontSize: '1rem', padding: 0 }}
                                    >
                                        <AddIcon /> Add
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            {sortedData.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell sx={{ padding: '4px' }}>
                                        {editRowIndex === index ? (
                                            <TextField
                                                fullWidth
                                                name="type"
                                                value={configData.type}
                                                onChange={(e) => handleInputChange(e, index, false)}
                                                size="small"
                                            />
                                        ) : (
                                            entry.type
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ padding: '4px' }}>
                                        {editRowIndex === index ? (
                                            <TextField
                                                fullWidth
                                                name="label"
                                                value={configData.label}
                                                onChange={(e) => handleInputChange(e, index, false)}
                                                size="small"
                                            />
                                        ) : (
                                            entry.label
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ padding: '4px' }}>
                                        {editRowIndex === index ? (
                                            <TextField
                                                fullWidth
                                                name="value"
                                                value={configData.value}
                                                onChange={(e) => handleInputChange(e, index, false)}
                                                size="small"
                                            />
                                        ) : (
                                            entry.value
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ padding: '4px' }}>
                                        {editRowIndex === index ? (
                                            <TextField
                                                fullWidth
                                                name="color"
                                                value={configData.color}
                                                onChange={(e) => handleInputChange(e, index, false)}
                                                size="small"
                                            />
                                        ) : (
                                            entry.color || 'None'
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ padding: '4px' }}>
                                        {editRowIndex === index ? (
                                            <TextField
                                                fullWidth
                                                name="parent"
                                                value={configData.parent}
                                                onChange={(e) => handleInputChange(e, index, false)}
                                                size="small"
                                            />
                                        ) : (
                                            entry.parent || 'None'
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ padding: '4px' }}>
                                        {editRowIndex === index ? (
                                            <>
                                                <IconButton color="primary" onClick={() => handleSave(entry)}>
                                                    <SaveIcon />
                                                </IconButton>
                                                <IconButton color="secondary" onClick={handleCancelEdit}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton color="primary" onClick={() => handleEdit(index)}>
                                                    <EditIcon style={{ cursor: 'pointer', fontSize: '1.1rem' }} />
                                                </IconButton>
                                                <IconButton color="secondary" onClick={() => { setConfigToDelete(entry); setOpenDeleteDialog(true); }}>
                                                    <DeleteIcon style={{ cursor: 'pointer', fontSize: '1.1rem' }} />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this item?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="default">Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={"success"} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>


        </Box>

    );
};

export default ConfigMasterMaintenance;
