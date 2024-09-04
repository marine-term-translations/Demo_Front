import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Translate = () => {
    // window.location.reload()
    const navigate = useNavigate();
    const [contents, setContents] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editableTerm, setEditableTerm] = useState({});
    const [translations, setTranslations] = useState([]);
    const [error, setError] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);

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
            const branchExists = sessionStorage.getItem('branch');
            if (!branchExists) {
                sessionStorage.setItem("branch", branch);
                window.location.reload()
            }else{
                sessionStorage.setItem("branch", branch);
            }
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
            window.history.replaceState(null, '', newUrl);
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

                const responseConfig = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/content`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                        path: "config.yml"
                    },
                    headers: {
                        'Authorization': sessionStorage.getItem("github_token")
                    }
                });
                const content = responseConfig.data;
                setConfig(content);
                setSelectedLanguage(content.target_languages[0]);
                setLoading(false);
                setError(null);
            } catch (error) {
                console.error('Error fetching content:', error);
                setLoading(false);
                setError('Failed to fetch content from the server.');
            }
        };
        fetchToken();
    }, [navigate]);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>;
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
        console.log("click");
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
        if (translations[filename]) {
            try {
                const translation = Object.entries(translations[filename]).reduce((acc, [labelKey, translationObj]) => {
                    acc[labelKey] = { [selectedLanguage]: translationObj[selectedLanguage] };
                    return acc;
                }, {});
                
                await axios.put(
                    `${process.env.REACT_APP_BACK_URL}/api/github/update`,
                    {
                        repo: process.env.REACT_APP_REPO,
                        translations: translation,
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
                setError(null);
            } catch (error) {
                console.error('Error updating file:', error);
                setError('Failed to update the file.');
            }
        }else{
            alert(`You don't make a change for ${filename}`);
            setError(null);
        }
    };

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    const updateAll = () => {
        alert(`In Dev`);
    };
    return (
        <div>
            <h1>File contents</h1>
            <h2><a href={`#/branches`}>Go Back</a></h2>

            <table border={1} style={{ width: '90vw', height: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th><pre>       </pre></th>
                        <th>Field</th>
                        <th>Original</th>
                        <th>
                            <label htmlFor="languageselect">Translation language : </label>
                            <select id="languageselect" name="languageselect" value={selectedLanguage} onChange={handleLanguageChange}>
                                {config.target_languages.map((language) => (
                                    <option key={language} value={language}>{language}</option>
                                ))}
                            </select>
                        </th>
                        <th>Status</th>
                        <th><pre>       </pre></th>
                    </tr>
                </thead>
                <tbody>
                    {transformedData.map(data => {
                        const totalRows = Object.keys(data.label[0]).length;

                        return (
                            <>
                                {Object.entries(data.label[0]).map(([labelName, labelData], index) => {
                                    const isFirstRow = index === 0;

                                    return (
                                        <tr key={`${data.filename}-${labelName}`}>
                                            {isFirstRow && (
                                                <td rowSpan={totalRows}></td>
                                            )}
                                            <td>{labelName}</td>
                                            <td style={{ width: '30vw', overflow: 'hidden', textOverflow: 'ellipsis' }}>{labelData.original}</td>
                                            <td style={{ width: '30vw', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: '20vw'}}>
                                                <textarea 
                                                    value={translations[data.filename]?.[labelName] ? (
                                                        Object.prototype.hasOwnProperty.call(translations[data.filename]?.[labelName], selectedLanguage) ? (
                                                            translations[data.filename]?.[labelName]?.[selectedLanguage]
                                                        ) :(
                                                            labelData[selectedLanguage]
                                                        )
                                                    ):(
                                                        labelData[selectedLanguage]
                                                    )}
                                                    // readOnly={!editableTerm[`${data.filename}-${labelName}-${selectedLanguage}`]}
                                                    onClick={!editableTerm[`${data.filename}-${labelName}-${selectedLanguage}`] ? (() => handleEditClick(data.filename, labelName, selectedLanguage, labelData[selectedLanguage])) : (null)}
                                                    onChange={(e) => handleInputChange(e, data.filename, labelName, selectedLanguage)}
                                                    style={{ width: '97%', minHeight: '50px', resize: 'vertical', fontSize: '16px', fontFamily: 'inherit', lineHeight: '1.5', height: '99%'}}
                                                />
                                            </td>
                                            <td>
                                                {editableTerm[`${data.filename}-${labelName}-${selectedLanguage}`] ? (
                                                    translations[data.filename]?.[labelName]?.[selectedLanguage] !== labelData[selectedLanguage] ? (
                                                        !translations[data.filename]?.[labelName]?.[selectedLanguage] ? (
                                                            <span>Empty</span>
                                                        ) : (
                                                            <span>Modified</span>
                                                        )
                                                    ) : (
                                                        !translations[data.filename]?.[labelName]?.[selectedLanguage] ? (
                                                            <span>Empty</span>
                                                        ) : (
                                                            <span>No Modified</span>
                                                        )
                                                    )
                                                ) : (
                                                    labelData[selectedLanguage] === "" ? (
                                                        <span>Empty</span>
                                                    ) : (
                                                        <span>No Modified</span>
                                                    )
                                                )}
                                            </td>


                                            {isFirstRow && (
                                                <td rowSpan={totalRows} style={{ height: '100%' }}>
                                                    <button 
                                                        onClick={() => update(data.filename)}
                                                        style={{ width: '100%', height: '100%' }}
                                                    >
                                                        Save
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </>
                        );
                    })}
                    <tr>
                        <td colSpan={6}>
                            <button 
                                onClick={() => updateAll()}
                                style={{ width: '100%', height: '100%' }}
                            >
                                Save ALL ({selectedLanguage})
                            </button>
                        </td>
                    </tr>
                </tbody>

            </table>

            {/* <button onClick={() => update(transformedData[0]?.filename)}>Save All Changes</button> */}
        </div>
    );
};

export default Translate;