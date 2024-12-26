import React, { useState, useEffect, useCallback } from 'react'
import { MenuItem, Select, FormControl, CircularProgress } from '@mui/material'
import { fetchConfigMaster } from '../../services/configMaster'
import { useSelector } from 'react-redux'

const StatusDropdown = ({ selectedTicket, onUpdateStatus }) => {
  const userName = useSelector((state) => state.app.userName)
  const [status, setStatus] = useState(selectedTicket?.status || 'open')
  const [availableStatuses, setAvailableStatuses] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [loading, setLoading] = useState(true)

  // Determine if the current user has specific roles
  const isCreator = userName === selectedTicket?.creator?.username
  const isAssignee = userName === selectedTicket?.assignee?.username
  const isApprover = userName === selectedTicket?.approver?.username

  console.log('test rerender issue')

  // Fetch status options from the backend
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const responseConfig = await fetchConfigMaster()
        const configs = responseConfig?.data || []
        const statuses = configs
          .filter((config) => config.type === 'status')
          .map((config) => ({
            label: config.label,
            value: config.value || config.id
          }))
        setStatusOptions(statuses)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching status options:', error)
        setLoading(false)
      }
    }
    fetchStatuses()
  }, [status])

  // Determine available statuses based on current status and user role
  const getAvailableStatuses = useCallback(() => {
    switch (status) {
      case 'open':
        return isCreator || isAssignee ? ['in_progress', 'to_be_approved'] : []
      case 'in_progress':
        return isAssignee ? ['resolved'] : []
      case 'to_be_approved':
        return isApprover ? ['approved'] : []
      case 'approved':
        return isAssignee ? ['in_progress'] : []
      case 'resolved':
        return isCreator || isAssignee ? ['closed', 'open'] : []
      case 'closed':
        return []
      default:
        return []
    }
  }, [isApprover, isAssignee, isCreator, status])

  // Update available statuses whenever the status or user roles change
  useEffect(() => {
    const validTransitions = getAvailableStatuses()

    // Ensure the current status is included in the dropdown options
    const filteredOptions = statusOptions
      .map((option) => {
        let updatedLabel = option.label
        if (option.value !== status) {
          if (status === 'open' && option.value === 'in_progress')
            updatedLabel = 'Start Ticket without Approval'
          if (status === 'approved' && option.value === 'in_progress')
            updatedLabel = 'Start Progress'
          if (option.value === 'approved') updatedLabel = 'Approve Ticket'
          if (option.value === 'to_be_approved')
            updatedLabel = 'Send Ticket for Approval'
          if (option.value === 'resolved') updatedLabel = 'Resolve Ticket'
          if (option.value === 'closed') updatedLabel = 'Close Ticket'
        }
        const updatedOption = { value: option.value, label: updatedLabel }
        return updatedOption
      })
      .filter(
        (option) =>
          validTransitions.includes(option.value) || option.value === status
      )

    setAvailableStatuses(filteredOptions)
  }, [status, statusOptions, userName, getAvailableStatuses])

  // Handle status change
  const handleChange = (event) => {
    const newStatus = event.target.value
    onUpdateStatus(status, newStatus)
    setStatus(newStatus)
  }

  if (loading) {
    return <CircularProgress size={24} />
  }

  return (
    <FormControl size="small" sx={{ m: 1, minWidth: 120 }}>
      <Select
        value={status}
        onChange={handleChange}
        disabled={availableStatuses.length === 0}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: 'primary.dark'
          },
          '& .MuiSelect-icon': {
            color: 'white'
          }
        }}
      >
        {availableStatuses.map((statusOption) => (
          <MenuItem
            key={statusOption.value}
            value={statusOption.value}
            disabled={statusOption.value === status}
          >
            {statusOption.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default StatusDropdown
