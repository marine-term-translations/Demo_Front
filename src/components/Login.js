import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [gitHubLink, setGitHubLink] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("github_token")) {
      navigate('/branches');
    }
    const fetchGitHubLink = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/oauth/link`);
        const path = window.location.protocol + "//" + window.location.host + window.location.pathname ;
        console.log(path);
        const { client_id, scope } = response.data;
        const AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}&redirect_uri=${path}#callback`;
        setGitHubLink(AUTH_URL);
      } catch (error) {
        if (error.response) {
          setError(`Error: ${error.response.data.message || 'Server Error'}`);
        } else if (error.request) {
          setError('No response from the server. Please check your network.');
        } else {
          setError(`Request error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubLink();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h1>Login with GitHub</h1>
      {gitHubLink ? <a href={gitHubLink}>Login</a> : <p>Failed to load GitHub login link.</p>}
    </div>
  );
};

export default Login;
