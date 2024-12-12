import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchActivityLogsByUserId,
  deleteActivityLog,
} from '../services/activityLog';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Card,
  Button,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';

const UserActivityLog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        setError('No activity logs available.');
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date not available';
    }

    const cleanedDateString = dateString.split('.')[0];
    const date = new Date(cleanedDateString);
    return isNaN(date.getTime()) ? 'Date not available' : date.toLocaleString();
  };

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this activity log?')) {
      try {
        await deleteActivityLog(logId);
        setActivityLogs((prevLogs) =>
          prevLogs.filter((log) => log.id !== logId)
        );
      } catch (error) {
        setError('Failed to delete activity log');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <Typography variant="body1">Loading...</Typography>;
  if (error) return <Typography variant="body1">{error}</Typography>;

  return (
    <div style={{ padding: '20px' }}>
      <Card sx={{ maxWidth: 600, margin: 'auto', mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ marginBottom: '16px' }}>
            Your Activity
          </Typography>
          {activityLogs.length > 0 ? (
            <div>
              {[...activityLogs].reverse().map((log) => (
                <Card key={log.id} sx={{ mb: 3, position: 'relative' }}>
                  <CardContent>
                    <IconButton
                      onClick={() => handleDelete(log.id)}
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        width: 16,
                        height: 16,
                        padding: 0,
                        fontSize: 14,
                        // color: '#e74c3c',
                        background: 'none',
                        border: '1px solid ',
                        borderRadius: 0,
                        cursor: 'pointer',
                      }}
                      title="Delete Activity Log"
                    >
                      <DeleteIcon style={{ fontSize: '16px' }} />
                    </IconButton>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">
                        <strong>Action:</strong> {log.action}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date:</strong> {formatDate(log.created_at)}
                      </Typography>
                      {log.ticket_id && (
                        <Typography variant="body1">
                          <strong>Ticket ID:</strong> {log.ticket_id}
                        </Typography>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Typography variant="body1">No activity logs available.</Typography>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '15px',
            }}
          >
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityLog;
