import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatInTimeZone } from 'date-fns-tz';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Branches = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [emptyField, setEmptyField] = useState({});
    const [emptyFieldFile, setEmptyFieldFile] = useState({});
    const [totalFileCounts, setTotalFileCounts] = useState({});
    const navigate = useNavigate();

    const isEmpty = (str) => !str || !/[a-zA-Z0-9]/.test(str);

    useEffect(() => {
        const fetchBranches = async () => {
            const token = sessionStorage.getItem("github_token");
            if (!token) {
                setError('Authorization token is missing or invalid. Redirecting to home...');
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.hash}`;
            window.history.replaceState(null, '', newUrl);

            try {
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/branches`, {
                    params: { repo: process.env.REACT_APP_REPO },
                    headers: { 'Authorization': token }
                });
                
                const branchesData = response.data;
                setBranches(branchesData);

                const emptyFields = {};
                const emptyFieldsFile = {};
                const totalFileCounts = {};
                await Promise.all(branchesData.map(async (branchData) => {
                    const branch = branchData.name;
                    const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/diff`, {
                        params: { repo: process.env.REACT_APP_REPO, branch },
                        headers: { 'Authorization': token }
                    });

                    const contents = response.data;
                    const translationCounts = {};
                    const fileCounts = {};
                    totalFileCounts[branch] = 0;

                    contents.forEach(file => {
                        const firstInFile = {};
                        totalFileCounts[branch]++;

                        file.content.labels.forEach(label => {
                            label.translations.forEach(translation => {
                                Object.entries(translation).forEach(([lang, value]) => {
                                    if (!translationCounts[lang]) {
                                        translationCounts[lang] = 0;
                                        fileCounts[lang] = 0;
                                    }

                                    if (isEmpty(value)) {
                                        translationCounts[lang]++;
                                        if (!firstInFile[lang]) {
                                            firstInFile[lang] = true;
                                            fileCounts[lang]++;
                                        }
                                    }
                                });
                            });
                        });

                    });

                    emptyFields[branch] = translationCounts;
                    emptyFieldsFile[branch] = fileCounts;
                }));
                setEmptyField(emptyFields);
                setEmptyFieldFile(emptyFieldsFile);
                setTotalFileCounts(totalFileCounts);
                setLoading(false);
                setError(null);
            } catch (error) {
                const errorMessage = error.response?.data?.message 
                    ? error.response.data.message 
                    : error.request 
                        ? 'Network error. Please check your connection and try again.' 
                        : 'An unexpected error occurred. Please try again.';
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchBranches();
    }, [navigate]);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <Container className="d-flex flex-column align-items-center">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh'}}>
                    <Spinner animation="border" />
                </div>
            ) : error ? (
                <Alert variant="danger">
                    <p>{error}</p>
                </Alert>
            ) : (
                <Table bordered hover responsive="md" className="text-center" style={{ verticalAlign: 'middle' }}>
                    <thead>
                        <tr>
                            <th>Branch Name</th>
                            <th>Last Commit</th>
                            <th>empty field</th>
                            <th>files whith empty field</th>
                            <th>files</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map(branch => {
                            const formattedDate = formatInTimeZone(branch.lastCommit, userTimeZone, 'dd/MM/yyyy HH:mm:ss');
                            const emptyFieldCounts = emptyField[branch.name];
                            const emptyFieldFileCounts = emptyFieldFile[branch.name];
                            return (
                                <tr key={branch.name}>
                                    <td><a href={`?branch=${branch.name}#/translate`}>{branch.name}</a></td>
                                    <td>{formattedDate}</td>
                                    {emptyFieldCounts ? (
                                        <>
                                            <td>
                                                <ul className="list-unstyled m-auto">
                                                    {Object.entries(emptyFieldCounts).map(([lang, count]) => (
                                                        <li key={lang}>{lang}: {count} field(s)</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                <ul className="list-unstyled m-auto">
                                                    {Object.entries(emptyFieldCounts).map(([lang, count]) => (
                                                        <li key={lang}>{lang}: {emptyFieldFileCounts[lang]} file(s)</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                {totalFileCounts[branch.name]}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>
                                                'No data'
                                            </td>
                                            <td>
                                                'No data'
                                            </td>
                                            <td>
                                                'No data'
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Branches;