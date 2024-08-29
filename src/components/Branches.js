import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatInTimeZone } from 'date-fns-tz';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            // Check for token in sessionStorage
            const token = sessionStorage.getItem("github_token");
            if (!token || token === "undefined") {
                setError('Authorization token is missing or invalid. Redirecting to home...');
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

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
            } finally {
                setLoading(false);
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
            <table border="1">
                <thead>
                    <tr>
                        <th>Branch Name</th>
                        <th>Last Commit</th>
                    </tr>
                </thead>
                <tbody>
                    {branches.map(branch => {
                        const formattedDate = formatInTimeZone(branch.lastCommit, userTimeZone, 'dd/MM/yyyy HH:mm:ss');
                        return (
                            <tr key={branch.name}>
                                <td><a href={`?branch=${branch.name}#/translate`}>{branch.name}</a></td>
                                <td>{formattedDate}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Branches;
