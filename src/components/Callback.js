import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACK_URL}/api/github/token`, { code });
        const { access_token } = response.data;
        sessionStorage.setItem('github_token', access_token);
        navigate('/branches');
      } catch (error) {
        if (error.response) {
          const { message } = error.response.data;
          setError(message || 'An unexpected error occurred. Please try again.');
        } else if (error.request) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        console.error('Error during token retrieval:', error);
        setTimeout(() => navigate('/'), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh'}}>
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh'}}>
          <Alert variant="danger">
            <p>{error}</p>
          </Alert>
        </div>
      ) : (
        <div>Redirecting...</div>
      )}
    </Container>
  );
};

export default Callback;
