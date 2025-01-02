import React, { useEffect, useState } from 'react'
import {
  Container,
  Grid,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchActivityLogsByUserId } from '../services/activityLog'

const Home = () => {
  const [recentActivity, setRecentActivity] = useState([])
  const userId = useSelector((state) => state.app.userId)
  const userRole = useSelector((state) => state.app.userRole)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetchActivityLogsByUserId(userId)
        setRecentActivity(response.data.slice(-5))
      } catch (error) {
        console.error('Failed to fetch recent activity logs', error)
      }
    }

    fetchActivity()
  }, [userId])

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date not available'
    }

    // Remove microseconds if present and create a valid Date object
    const cleanedDateString = dateString.split('.')[0]
    const date = new Date(cleanedDateString)
    return isNaN(date.getTime()) ? 'Date not available' : date.toLocaleString()
  }

  return (
    <Container sx={{ marginTop: 5 }}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
        sx={{ marginBottom: 4 }}
      >
        <Grid item>
          <Typography variant="h3" align="center">
            Welcome to TickTrack
          </Typography>
          <Typography variant="h6" align="center" sx={{ marginTop: 1 }}>
            Your one-stop solution for tickets tracking and more!
          </Typography>
        </Grid>
      </Grid>

      <Grid container justifyContent="center" spacing={2}>
        {userRole === 'admin' && (
          <Grid item md={4} xs={12}>
            <Button
              variant="contained"
              size="small"
              component={Link}
              to="/manage-users"
              fullWidth
            >
              Manage Users
            </Button>
          </Grid>
        )}
        <Grid item md={4} xs={12}>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to="/tickets"
            fullWidth
          >
            Manage Tickets
          </Button>
        </Grid>
      </Grid>

      <Grid container sx={{ marginTop: 5 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.length > 0 ? (
                recentActivity
                  .slice()
                  .reverse()
                  .map((log, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${log.action} - ${formatDate(log.created_at)}`}
                      />
                    </ListItem>
                  ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent activity available." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Home
