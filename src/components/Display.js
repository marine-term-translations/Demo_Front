import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Display = () => {
    // console.log("Display");
    const navigate = useNavigate();
    const [content, setContent] = useState(null);

    useEffect(() => {
        // console.log("Display effect");
        if (!sessionStorage.getItem("github_token")) {
            navigate('/');
        }
        const fetchToken = async () => {
            const params = new URLSearchParams(window.location.search);
            // console.log("collection :" + params.get('collection'));
            // console.log("languageselect :" + params.get('languageselect'));
            // console.log("Display");
            let collection;
            if (!(params.get('collection') && params.get('languageselect'))) {
                // console.log("1");
                if (!(sessionStorage.getItem("language") && sessionStorage.getItem("collection"))){
                    // console.log("2");
                    navigate('/collection');
                }else{
                    collection = sessionStorage.getItem("collection");
                }
            }else{
                collection = params.get('collection');
                const languageselect = params.get('languageselect');
                sessionStorage.setItem("language", languageselect);
                sessionStorage.setItem("collection", collection);
            }
            try {
                // console.log("collection try:" + collection);
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/list`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                        path: collection
                    },
                        headers: {
                        'Authorization': sessionStorage.getItem("github_token")
                    }
                });
                const content = response.data
                setContent(content)
                // console.log(response.data);
                console.log(content);

            } catch (error) {
                console.error('Erreur lors de l\'obtention du contenu:', error);
            }
        };

        fetchToken();
    }, [navigate]);

    if (!content) {
        return <div>loading.</div>;
    }
//   console.log(content);
    return (
        <div>
            <ul>
                {content.map((file, index) => (
                    <li key={file.path}>
                        <a href={`/${process.env.REACT_APP_REPO}/?path=${file.path}#/translate`}>{`${index + 1}. ${file.name}`}</a>
                        {/* <a href={`?path=${file.path}#/translate`}>{`${index + 1}. ${file.name}`}</a> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Display;
