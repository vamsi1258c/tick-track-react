import React from 'react'
import { Pagination, Box } from '@mui/material'

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (event, value) => {
    onPageChange(value)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2
      }}
    >
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        siblingCount={1}
        boundaryCount={1}
        variant="outlined"
        shape="rounded"
        color="primary"
      />
    </Box>
  )
}

export { CustomPagination }
