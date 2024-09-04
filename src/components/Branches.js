import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatInTimeZone } from 'date-fns-tz';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [emptyField, setEmptyField] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            // Check for token in sessionStorage
            const token = sessionStorage.getItem("github_token");
            if (!token || token === undefined) {
                setError('Authorization token is missing or invalid. Redirecting to home...');
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
                return;
            }
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
            window.history.replaceState(null, '', newUrl);

            try {
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/branches`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                    },
                    headers: {
                        'Authorization': token,
                    }
                });
                setBranches(response.data);
            } catch (error) {
                if (error.response) {
                    // API error
                    const { message } = error.response.data;
                    setError(message || 'An unexpected error occurred while loading branches.');
                } else if (error.request) {
                    // Network error
                    setError('Network error. Please check your connection and try again.');
                } else {
                    // Other errors
                    setError('An unexpected error occurred. Please try again.');
                }
            }
            try {
                const emptyFields = {};
                await Promise.all(
                    branches.map(async (data) => {
                        const branch = data.name;
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
                        const translationCounts = {};

                        contents.forEach(file => {
                            file.content.labels.forEach(label => {
                                label.translations.forEach(translation => {
                                    Object.entries(translation).forEach(([lang, value]) => {
                                        if (!translationCounts[lang]) {
                                            translationCounts[lang] = 0;
                                        }
                                        if (!translationCounts["total"]) {
                                            translationCounts["total"] = 0;
                                        }
                                        if (!value) {
                                            translationCounts[lang]++;
                                            translationCounts["total"]++;
                                            console.log("oui");
                                        }
                                    });
                                });
                            });
                        });
                        emptyFields[branch] = translationCounts;
                    })
                );
                console.log(emptyFields)
                setEmptyField(emptyFields);


                setLoading(false);
                setError(null);
            } catch (error) {
                console.error('Error fetching content:', error);
                setLoading(false);
                setError('Failed to fetch content from the server.');
            }
        };

        fetchBranches();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message"><p>{error}</p></div>;
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div>
            <table border="1" style={{ minWidth: '80%', height: '100%', borderCollapse: 'collapse',textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th>Branch Name</th>
                        <th>Last Commit</th>
                        <th>Empty field</th>
                    </tr>
                </thead>
                <tbody>
                    {branches.map(branch => {
                        const formattedDate = formatInTimeZone(branch.lastCommit, userTimeZone, 'dd/MM/yyyy HH:mm:ss');
                        const emptyFieldCounts = emptyField[branch.name];
                        return (
                            <tr key={branch.name}>
                                <td><a href={`?branch=${branch.name}#/translate`}>{branch.name}</a></td>
                                <td>{formattedDate}</td>
                                <td>
                                    {emptyFieldCounts ? (
                                        <ul style={{ marginLeft: '0', paddingLeft: '0', listStylePosition: 'inside' }}>
                                            {emptyFieldCounts.total !== undefined && (
                                                <li key="total">Total: {emptyFieldCounts.total}</li>
                                            )}
                                            {Object.entries(emptyFieldCounts).map(([lang, count]) => {
                                                if (lang !== 'total') {
                                                    return <li key={lang}>{lang}: {count}</li>;
                                                }
                                                return null;
                                            })}
                                        </ul>
                                    ) : (
                                        'No data'
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Branches;
