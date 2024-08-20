import React, { useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { parse } from "yaml";


const Translate = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editableLabels, setEditableLabels] = useState({});
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        // console.log(sessionStorage.getItem("github_token"));
        if (!sessionStorage.getItem("github_token")) {
            navigate('/');
        }
        const fetchToken = async () => {
            const params = new URLSearchParams(window.location.search);
            const path = params.get('path');
            // console.log(path);
            if (!(path)) {
                navigate('/collection');
            }
            sessionStorage.setItem("path", path);
            // const languageselect = params.get('languageselect');
            // if (languageselect) {
            //     sessionStorage.setItem("language", languageselect);
            // }
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/content`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                        path
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
                console.error('Erreur lors de l\'obtention du contenu:', error);
                setLoading(false);
            }
        };
        fetchToken();
    }, [navigate]);

    if (loading) {
        return <div>Chargement...</div>;
    }
    
    if (!content) {
        return <div>Erreur lors du chargement du contenu.</div>;
    }
    const handleEditClick = (labelName) => {
        setEditableLabels(prev => {
            const newState = { ...prev, [labelName]: !prev[labelName] };
            return newState;
        });
    };
    const handleInputChange = (event, labelName) => {
        const { value } = event.target;
        setTranslations(prev => ({
            ...prev,
            [labelName]: value
        }));
    };
    // console.log(content);
    const language = sessionStorage.getItem("language");

    

    return (
        <div>
            <h1>File's content</h1>
            <h2><a href={`#/display`}>Go Back</a></h2>
            <form method="GET" action={`#/update`}>
                <ul>
                    {content.labels.length > 0 ? (
                        content.labels.map(label => {
                            const translation = label.translations.find(t => t.hasOwnProperty(language));
                            const translationText = translation ? translation[language] : "";
                            const isEditable = editableLabels[label.name] || false;
                            const currentTranslation = translations[label.name] || translationText;

                            return (
                                <li key={label.name}>
                                    <div>
                                        <label>{label.name} :</label>
                                        <span>{label.original}</span>
                                    </div>
                                    <div>
                                        <label>Translations ({language}):</label>
                                        <input
                                            type="text"
                                            name={label.name}
                                            value={currentTranslation}
                                            disabled={!isEditable}
                                            onChange={(event) => handleInputChange(event, label.name)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleEditClick(label.name)}
                                            disabled={isEditable}
                                        >
                                            {isEditable ? 'New' : 'Edit'}
                                        </button>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <li>{content}</li>
                    )}
                </ul>
                <button type="submit">Send modify</button>
            </form>
        </div>
    );
};

export default Translate;
