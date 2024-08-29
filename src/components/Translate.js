import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Translate = () => {
    const navigate = useNavigate();
    const [contents, setContents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editableTerm, setEditableTerm] = useState({});
    const [translations, setTranslations] = useState([]);
    const [error, setError] = useState(null); // New state for error

    useEffect(() => {
        if (!sessionStorage.getItem("github_token")) {
            navigate('/');
        }
        const fetchToken = async () => {
            const params = new URLSearchParams(window.location.search);
            const branch = params.get('branch');
            if (!branch) {
                navigate('/branches');
            }
            sessionStorage.setItem("branch", branch);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/diff`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                        branch
                    },
                    headers: {
                        'Authorization': sessionStorage.getItem("github_token")
                    }
                });
                const contents = response.data;
                setContents(contents);
                setLoading(false);
                setError(null); // Clear error on successful fetch
            } catch (error) {
                console.error('Error fetching content:', error);
                setLoading(false);
                setError('Failed to fetch content from the server.'); // Set error message
            }
        };
        fetchToken();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>; // Display error message
    }

    if (!contents) {
        return <div>Error loading content.</div>;
    }

    const transformedData = contents.map(item => {
        const labels = item.content.labels.reduce((acc, label) => {
            acc[label.name] = {
                original: label.original,
                ...label.translations.reduce((transAcc, translation) => {
                    Object.keys(translation).forEach(lang => {
                        transAcc[lang] = translation[lang];
                    });
                    return transAcc;
                }, {})
            };
            return acc;
        }, {});
    
        return {
            filename: item.filename,
            label: [labels]
        };
    });

    const handleEditClick = (filename, labelName, key, term) => {
        setEditableTerm(prev => ({
            ...prev,
            [`${filename}-${labelName}-${key}`]: true
        }));

        setTranslations(prev => ({
            ...prev,
            [filename]: {
                ...(prev[filename] || {}),
                [labelName]: {
                    ...(prev[filename]?.[labelName] || {}),
                    [key]: prev[filename]?.[labelName]?.[key] || term
                }
            }
        }));
    };

    const handleInputChange = (event, filename, labelName, key) => {
        const { value } = event.target;
        
        setTranslations(prev => ({
            ...prev,
            [filename]: {
                ...(prev[filename] || {}),
                [labelName]: {
                    ...(prev[filename]?.[labelName] || {}),
                    [key]: value
                }
            }
        }));
    };

    const update = async (filename) => {
        console.log();
        if (translations[filename]) {
            console.log();
            try {
                await axios.put(
                    `${process.env.REACT_APP_BACK_URL}/api/github/update`,
                    {
                        repo: process.env.REACT_APP_REPO,
                        translations,
                        filename,
                        branch: sessionStorage.getItem("branch")
                    },
                    {
                        headers: {
                            'Authorization': sessionStorage.getItem("github_token")
                        }
                    }
                );
                alert("Update has been made successfully");
                setError(null); // Clear error on successful update
            } catch (error) {
                console.error('Error updating file:', error);
                setError('Failed to update the file.'); // Set error message
            }
        }else{
            alert(`You don't make a change for ${filename}`);
            setError(null);
        }
    };

    return (
        <div>
            <h1>Files' content</h1>
            <h2><a href={`#/branches`}>Go Back</a></h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Label Name</th>
                        <th>Language</th>
                        <th>Term</th>
                        <th>Modify</th>
                    </tr>
                </thead>
                <tbody>
                    {transformedData.map((item, index) => {
                        const labelKeys = Object.keys(item.label[0]);

                        let firstRowRendered = false;
                        const totalRowspan = labelKeys.reduce((acc, labelName) => {
                            return acc + Object.keys(item.label[0][labelName]).length;
                        }, 0);

                        return (
                            <>
                                {labelKeys.map((labelName, labelIndex) => {
                                    const terms = Object.entries(item.label[0][labelName]);

                                    return terms.map(([key, term], termIndex) => (
                                        <tr key={`form-row-${index}-${labelIndex}-${termIndex}`}>
                                            {!firstRowRendered && termIndex === 0 && (
                                                <>
                                                    <td rowSpan={totalRowspan}>{item.filename}</td>
                                                    <td rowSpan={terms.length}>{labelName}</td>
                                                </>
                                            )}
                                            {firstRowRendered && termIndex === 0 && (
                                                <td rowSpan={terms.length}>{labelName}</td>
                                            )}
                                            <td>{key}</td>
                                            
                                            {key === 'original' ? (
                                                <>
                                                    <td>{term}</td>
                                                    <td></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <textarea 
                                                            value={translations[item.filename]?.[labelName]?.[key] || term}
                                                            disabled={!editableTerm[`${item.filename}-${labelName}-${key}`]}
                                                            onChange={(e) => handleInputChange(e, item.filename, labelName, key)}
                                                            style={{ width: '99%', minHeight: '50px', resize: 'vertical', fontSize: '16px', fontFamily: 'inherit', lineHeight: '1.5' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleEditClick(item.filename, labelName, key, term)}
                                                            disabled={editableTerm[`${item.filename}-${labelName}-${key}`]}
                                                            style={{ width: '99%', height: '50px'}}
                                                        >
                                                            {editableTerm[`${item.filename}-${labelName}-${key}`] ? 'Editing' : 'Edit'}
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                            
                                            {termIndex === terms.length - 1 && (firstRowRendered = true)}
                                        </tr>
                                    ))
                                })}
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => update(item.filename)}
                                            style={{ width: '100%', height: '50px' }}
                                        >
                                            Update {item.filename}
                                        </button>
                                    </td>
                                </tr>
                            </>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Translate;