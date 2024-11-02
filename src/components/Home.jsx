import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchActivityLogsByUserId } from '../services/activityLog';

const Home = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  console.log(userId);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetchActivityLogsByUserId(userId);
        setRecentActivity(response.data.slice(-5));
      } catch (error) {
        console.error("Failed to fetch recent activity logs", error);
      }
    };

    fetchActivity();
  }, [userId]);


  const formatDate = (dateString) => {
    if (!dateString) {
      return "Date not available"; 
    }

    // Remove microseconds if present and create a valid Date object
    const cleanedDateString = dateString.split('.')[0];
    const date = new Date(cleanedDateString);
    return isNaN(date.getTime()) ? "Date not available" : date.toLocaleString();
  };
  return (
    <Container className="mt-5">
      <Row className="text-center mb-4">
        <Col>
          <h1>Welcome to TickTrack</h1>
          <p>Your one-stop solution for tickets tracking and more!</p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        {userRole === "admin" && (
          <Col md={4} className="text-center mb-3">
            <Button variant="primary" size='sm' as={Link} to="/manage-users">
              Manage Users
            </Button>
          </Col>
        )}
        <Col md={4} className="text-center mb-3">
          <Button variant="secondary" size='sm' as={Link} to="/tickets">
            Manage Tickets
          </Button>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h3>Recent Activity</h3>
          <ul>
            {recentActivity.length > 0 ? (
              recentActivity.slice().reverse().map((log, index) => (
                <li key={index}>
                  {log.action} - {formatDate(log.created_at)}
                </li>
              ))
            ) : (
              <li>No recent activity available.</li>
            )}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
