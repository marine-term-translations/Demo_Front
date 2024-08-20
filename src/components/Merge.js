import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Merge = () => {
  const navigate = useNavigate();
  console.log("merge")
  if (!sessionStorage.getItem("github_token")) {
    navigate('/');
  }

  useEffect(() => {
    const fetchToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const pullnumber = params.get('pullnumber');
      // console.log(pullnumber)
      try {
        const response = await axios.put(`${process.env.REACT_APP_BACK_URL}/api/github/pull`, {
            repo: process.env.REACT_APP_REPO,
            pullnumber,
          },
          {
            headers: {
              'Authorization': sessionStorage.getItem("github_token")
            }
          } 
        );
        // console.log(response.data)
        navigate('/changed');
      } catch (error) {
        console.error('Erreur lors du merge :', error);
      }
    };

    fetchToken();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Merge;
