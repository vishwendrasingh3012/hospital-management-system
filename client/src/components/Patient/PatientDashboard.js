// client/src/components/Patient/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaHistory, FaCommentMedical, FaFileInvoiceDollar } from 'react-icons/fa';
import axios from 'axios';
import './PatientDashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingBills: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.id) {
          throw new Error('User information not found');
        }

        // Set user name from local storage
        setUserName(userInfo.name || '');

        const response = await axios.get(
          `http://localhost:5000/api/appointments/patient/${userInfo.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        // Process appointments to get stats
        const appointments = response.data;
        const now = new Date();
        
        const stats = {
          totalAppointments: appointments.length,
          upcomingAppointments: appointments.filter(apt => {
            try {
              const aptDate = new Date(apt.date);
              return aptDate > now && 
                (apt.status === 'booked' || apt.status === 'pending');
            } catch (error) {
              console.error('Error processing appointment date:', error);
              return false;
            }
          }).length,
          completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
          pendingBills: appointments.filter(apt => apt.status === 'completed' && !apt.paid).length || 0
        };

        setStats(stats);
        setError(null);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = (route) => {
    if (route === '/patient/bills') {
      setShowComingSoon(true);
    } else {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="alert alert-danger mt-5" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      <Container>
        <div className="greeting-section">
          <h1 className="greeting-text">
            {getGreeting()}, {userName}!
          </h1>
          <p className="greeting-subtitle">Welcome to your health dashboard</p>
        </div>

        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/book-appointment')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-primary">
                    <FaCalendarPlus className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Book Appointment</h6>
                    <h3 className="card-value">New</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/medical-history')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-success">
                    <FaHistory className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Medical History</h6>
                    <h3 className="card-value">{stats.completedAppointments}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/feedback')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-info">
                    <FaCommentMedical className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Provide Feedback</h6>
                    <h3 className="card-value">Give</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/bills')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-warning">
                    <FaFileInvoiceDollar className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Pending Bills</h6>
                    <h3 className="card-value">{stats.pendingBills}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Information Section */}
        <Row className="mt-5">
          <Col md={12}>
            <Card className="info-card">
              <Card.Body>
                <h4 className="info-title">Upcoming Appointments</h4>
                <div className="appointment-count">
                  <span className="number">{stats.upcomingAppointments}</span>
                  <span className="label">Scheduled</span>
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => handleCardClick('/patient/appointments')}
                >
                  View All Appointments
                </button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={showComingSoon} onHide={() => setShowComingSoon(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Coming Soon!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>The billing feature is currently under development and will be available soon.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowComingSoon(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default PatientDashboard;
