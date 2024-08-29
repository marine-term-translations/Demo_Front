import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("github_token")) {
      navigate('/branches');
    }
    const fetchToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) {
        navigate('/');
      }
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACK_URL}/api/github/token`, {
          code
        });
        const { access_token } = response.data;
        sessionStorage.setItem('github_token', access_token);
        navigate('/branches');
      } catch (error) {
          // Handle different types of errors
        if (error.response) {
          const { message } = error.response.data;
          setError(message || 'An unexpected error occurred. Please try again.');
        } else if (error.request) {
          // No response was received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something else happened
          setError('An unexpected error occurred. Please try again.');
        }

        console.error('Error during token retrieval:', error);
        setTimeout(() => navigate('/'), 5000);
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <div>
      {error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Callback;
