import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { parse } from "yaml";

const Collection = () => {
  // console.log("collection");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("github_token") || sessionStorage.getItem("github_token") === "undefined") {
      navigate('/');
    }
    const fetchToken = async () => {
      // console.log(`url : ${process.env.REACT_APP_BACK_URL}`);
      console.log(`github_token : ${sessionStorage.getItem("github_token")}`);
      // console.log(`repo : ${process.env.REACT_APP_REPO}`);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/content`, {
          params: {
            repo: process.env.REACT_APP_REPO,
            path: "config.yml"
          },
          headers: {
            'Authorization': sessionStorage.getItem("github_token")
          }
        });
        const content = parse(response.data);
        // console.log(content);
        setContent(content);
        setLoading(false);
      } catch (error) {
        console.error('Error while loading config.yml', error);
        setLoading(false);
      }
    };

    fetchToken();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Error while loading config.yml.</div>;
  }

  return (
    <div>
      <form action="#/display" method="get">
        <label htmlFor="collection">Select the collection : </label>
        <select id="collection" name="collection" required>
          {content.sources.map((source) => (
            <option key={source.name} value={source.name}>{source.name}</option>
          ))}
        </select><br />
        <label htmlFor="languageselect">Select translation language : </label>
        <select id="languageselect" name="languageselect" required>
          {content.target_languages.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select><br />
        <button type="submit">Display</button>
      </form>
    </div>
  );
};

export default Collection;
