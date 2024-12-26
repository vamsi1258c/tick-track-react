import React, { useEffect, useState, useCallback } from 'react'
import { fetchTickets, deleteTicket } from '../../services/ticket'
import { fetchUsers } from '../../services/authService'
// import { downloadAttachment } from '../../services/attachment'
import { fetchConfigMaster } from '../../services/configMaster'
import { useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import {
  renderCategoryBadge,
  renderStatusBadge,
  renderPriorityBadge
} from '../../utils/renderBadges'
import {
  Table,
  Button,
  CircularProgress,
  Pagination,
  IconButton,
  Grid,
  TextField,
  Autocomplete,
  InputAdornment,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Menu
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Tune as TuneIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'
import { useSelector } from 'react-redux'

import './TicketsList.css'
import TicketViewModal from './TicketViewModal'
import { exportToCSV, exportToExcel } from '../../utils/exportUtils'
import { useSnackbar } from '../Snackbar'

const TicketsList = () => {
  const userName = useSelector((state) => state.app.userName)
  const userRole = useSelector((state) => state.app.userRole)
  const [tickets, setTickets] = useState([])
  const [users, setUsers] = useState([])
  const [configs, setConfigs] = useState([])
  const [filter, setFilter] = useState('all')
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [priorityFilter, setPriorityFilter] = useState([])
  const [categoryFilter, setCategoryFilter] = useState([])
  const [statusFilter, setStatusFilter] = useState([])
  const [loading, setLoading] = useState(false)
  const [userFilter, setUserFilter] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  })
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [ticketsPerPage, setTicketsPerPage] = useState(7)
  const totalPages = Math.ceil(tickets.length / ticketsPerPage)
  const indexOfLastTicket = currentPage * ticketsPerPage
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket)
  const [anchorEl, setAnchorEl] = useState(null)

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber)
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  console.log('INSIDE TICKET LIST', userName, userRole)

  const exportColumns = [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'category',
    'subcategory',
    'created_at',
    'creator',
    'updated_at',
    'assignee'
  ]

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  const stripHtml = (html) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchTickets()
      const responseUsers = await fetchUsers()
      setUsers(responseUsers.data)

      const responseConfig = await fetchConfigMaster()
      setConfigs(responseConfig.data)

      setTicketsPerPage(7)

      let filteredTickets = response.data

      if (userRole === 'admin' || userRole === 'support') {
        // Admins and support can see all tickets, no filter needed
      } else {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.creator?.username === userName
        )
      }

      if (filter === 'assigned_to_me') {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.assignee?.username === userName
        )
      } else if (filter === 'created_by_me') {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.creator?.username === userName
        )
      }
      if (userFilter.length > 0) {
        filteredTickets = filteredTickets.filter((ticket) => {
          return userFilter.includes(ticket.assignee?.username)
        })
      }
      if (statusFilter.length > 0) {
        filteredTickets = filteredTickets.filter((ticket) =>
          statusFilter.includes(ticket.status)
        )
      }
      if (priorityFilter.length > 0) {
        filteredTickets = filteredTickets.filter((ticket) =>
          priorityFilter.includes(ticket.priority)
        )
      }
      if (categoryFilter.length > 0) {
        filteredTickets = filteredTickets.filter((ticket) =>
          categoryFilter.includes(ticket.category)
        )
      }

      if (searchText?.trim()) {
        const searchLower = searchText.toLowerCase().trim()

        filteredTickets = filteredTickets.filter((ticket) => {
          const title = ticket.title?.toLowerCase() || ''
          const plainDescription =
            stripHtml(ticket.description)?.toLowerCase() || ''
          const id = String(ticket.id) || ''
          return (
            id.includes(searchLower) ||
            title.includes(searchLower) ||
            plainDescription.includes(searchLower)
          )
        })
      }

      // Sorting logic
      filteredTickets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })

      setTickets(filteredTickets)
    } catch (error) {
      console.error('Failed to load tickets', error)
      showSnackbar('Failed to load tickets', 'error')
    }
    setLoading(false)
  }, [
    filter,
    userName,
    priorityFilter,
    categoryFilter,
    statusFilter,
    searchText,
    sortConfig,
    userRole,
    userFilter,
    showSnackbar
  ])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id)
      loadTickets()
    } catch (error) {
      console.error('Failed to delete ticket', error)
      showSnackbar('Failed to delete ticket', 'error')
      if (error.response && error.response.status === 401) {
        navigate('/signin')
      }
    }
    setShowDeleteModal(false)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket)
    setShowViewModal(true)
  }

  // const handleDownloadAttachment = async (ticketid, attachmentId) => {
  //   try {
  //     await downloadAttachment(ticketid, attachmentId)
  //   } catch (error) {
  //     console.error('Failed to download attachment', error)
  //   }
  // }

  const handleAddUser = () => {
    navigate('/create-ticket')
  }

  const handleRefresh = () => {
    loadTickets()
  }

  const handleTicketsPerPageChange = (event) => {
    setTicketsPerPage(event.target.value)
    setCurrentPage(1)
  }

  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const priorityOptions = configs
    .filter((config) => config.type === 'priority')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id
    }))

  const statusOptions = configs
    .filter((config) => config.type === 'status')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id
    }))

  const categoryOptions = configs
    .filter((config) => config.type === 'category')
    .map((config) => ({
      label: config.label,
      value: config.value || config.id
    }))

  return (
    <div className="ticket-list-container">
      <div className="sticky-header">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Tickets
          </Typography>

          <Box display="flex">
            <Button
              variant="outlined"
              onClick={handleRefresh}
              size="small"
              sx={{ ml: 2 }}
            >
              <RefreshIcon /> Refresh
            </Button>
            <Button
              variant="contained"
              onClick={handleAddUser}
              size="small"
              sx={{ ml: 2 }}
            >
              <AddIcon /> Add
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={toggleFilters}
              sx={{
                p: 0,
                minWidth: '30px',
                height: '30px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'black'
              }}
            >
              <TuneIcon />
              {filtersVisible ? (
                <ExpandLessIcon
                  style={{ fontSize: '0.75rem', color: 'black' }}
                />
              ) : (
                <ExpandMoreIcon
                  style={{ fontSize: '0.75rem', color: 'black' }}
                />
              )}
            </Button>
          </Box>

          {/* More button with menu */}
          <Button
            onClick={handleMoreClick}
            sx={{
              minWidth: '30px',
              height: '30px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'black'
            }}
          >
            <MoreVertIcon sx={{ fontSize: '1.5rem' }} />
          </Button>

          {/* More menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{ mt: 2 }}
          >
            <MenuItem
              onClick={() => {
                exportToCSV(tickets, exportColumns, 'tickets')
                handleClose()
              }}
            >
              Export CSV
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportToExcel(tickets, exportColumns, 'tickets')
                handleClose()
              }}
            >
              Export Excel
            </MenuItem>
          </Menu>
        </Box>

        <div className="search-filter-container">
          {filtersVisible && (
            <Grid container spacing={2} alignItems="center">
              {/* Search Bar */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search by id, title, or description"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value.trim())}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {/* Clear button */}
                        {searchText && (
                          <IconButton
                            onClick={() => setSearchText('')}
                            edge="end"
                          >
                            <Clear />
                          </IconButton>
                        )}
                        {/* Search button */}
                        <IconButton>
                          <FaSearch />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Tickets Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={[
                    { label: 'Assigned to Me', value: 'assigned_to_me' },
                    { label: 'Created by Me', value: 'created_by_me' }
                  ]}
                  onChange={(event, newValue) =>
                    setFilter(newValue ? newValue.value : 'all')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Me"
                      variant="outlined"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  multiple
                  fullWidth
                  size="small"
                  options={users.map((user) => ({
                    label: user.username,
                    value: user.username
                  }))}
                  onChange={(event, newValue) =>
                    setUserFilter(newValue.map((option) => option.value))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Assignee"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value
                  }
                />
              </Grid>

              {/* Priorities Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  multiple
                  size="small"
                  fullWidth
                  options={priorityOptions}
                  onChange={(event, newValue) =>
                    setPriorityFilter(newValue.map((option) => option.value))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Priorities"
                      variant="outlined"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                />
              </Grid>

              {/* Statuses Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  multiple
                  size="small"
                  fullWidth
                  options={statusOptions}
                  onChange={(event, newValue) =>
                    setStatusFilter(newValue.map((option) => option.value))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Statuses"
                      variant="outlined"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                />
              </Grid>

              {/* Dummy Category Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  multiple
                  size="small"
                  fullWidth
                  options={categoryOptions}
                  onChange={(event, newValue) =>
                    setCategoryFilter(newValue.map((option) => option.value))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Category"
                      variant="outlined"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                />
              </Grid>
            </Grid>
          )}
        </div>
      </div>
      <div>
        {loading ? (
          <div className="loading-container">
            <CircularProgress size={24} />
          </div>
        ) : (
          <>
            <Table className="tickets-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')}>
                    ID{' '}
                    {sortConfig.key === 'id' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('title')}>
                    Title{' '}
                    {sortConfig.key === 'title' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTickets.length > 0 ? (
                  currentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <td>{ticket.id}</td>
                      <td className="truncate">{ticket.title}</td>
                      <td>{renderCategoryBadge(ticket.category)}</td>
                      <td>{renderStatusBadge(ticket.status)}</td>
                      <td>{renderPriorityBadge(ticket.priority)}</td>
                      <td>{ticket.assignee?.username}</td>
                      <td>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate('/view-ticket', {
                              state: { ticketId: ticket.id }
                            })
                          }}
                          className="action-icon"
                        >
                          <VisibilityIcon sx={{ fontSize: 15 }} />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate('/edit-ticket', {
                              state: { ticketId: ticket.id }
                            })
                          }}
                          className="action-icon"
                        >
                          <EditIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                        {ticket.creator?.username === userName && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              setTicketToDelete(ticket)
                              setShowDeleteModal(true)
                            }}
                            className="action-icon"
                          >
                            <DeleteIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-tickets">
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              {/* Pagination Section */}
              <div className="pagination-container">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => handlePageChange(page)}
                  siblingCount={1}
                  boundaryCount={1}
                  size="small"
                />
              </div>

              {/* Tickets Per Page Control */}
              <FormControl size="small" sx={{ minWidth: 80, ml: 2 }}>
                <Select
                  value={ticketsPerPage}
                  onChange={handleTicketsPerPageChange}
                  displayEmpty
                  variant="standard"
                  sx={{
                    border: 'none',
                    boxShadow: 'none',
                    '& fieldset': { border: 'none' }
                  }}
                >
                  {[5, 7, 10, 15, 20, 30, 40, 50].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Page Info */}
              <Typography variant="body2" sx={{ ml: 2 }}>
                Page {currentPage} of {totalPages}
              </Typography>
            </Box>
          </>
        )}
      </div>
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        fullWidth
        maxWidth="xs"
        sx={{
          '& .MuiDialog-paper': {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '0.875rem',
            color: '#333'
          }
        }}
      >
        <DialogTitle>
          Delete Ticket
          <IconButton
            aria-label="close"
            onClick={() => setShowDeleteModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body1">
            Are you sure you want to delete the ticket?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            #{ticketToDelete?.id} - {ticketToDelete?.title}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowDeleteModal(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => handleDelete(ticketToDelete?.id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <TicketViewModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedTicket={selectedTicket}
        renderCategoryBadge={renderCategoryBadge}
        renderStatusBadge={renderStatusBadge}
        renderPriorityBadge={renderPriorityBadge}
        navigate={navigate}
      />
    </div>
  )
}

export default TicketsList
