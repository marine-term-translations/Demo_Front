import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DiffViewer from 'react-diff-viewer-continued';
import { formatInTimeZone } from 'date-fns-tz';
import { useNavigate } from 'react-router-dom';

const Changed = () => {
    const [diffs, setDiffs] = useState([]);
    const [comments, setComments] = useState([]);
    const [pullnumber, setPullnumber] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upToDate, setUpToDate] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [conflicts, setConflicts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionStorage.getItem("github_token")) {
            navigate('/');
        }
        const branch = sessionStorage.getItem("branch")
        if (!branch) {
            navigate('/branches');
        }
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/changed`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                        branch
                    },
                    headers: {
                        'Authorization': sessionStorage.getItem("github_token")
                    }
                });
                const responseConflicts = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/conflicts`, {
                    params: {
                        repo: process.env.REACT_APP_REPO,
                        branch
                    },
                    headers: {
                        'Authorization': sessionStorage.getItem("github_token")
                    }
                });
                setConflicts(responseConflicts.data);

                if (response.data.compare) {
                    setUpToDate(true);
                }

                const { diffsData, commentsData, pullnumber } = response.data;

                setDiffs(diffsData);
                setComments(commentsData);
                setPullnumber(pullnumber);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des fichiers de la pull request:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Chargement...</div>;
    }
    if (upToDate) {
        return <div>Pas de nouveau commit</div>;
    }
    
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleLineNumberClick = (lineId, event, filename) => {
        console.log(lineId)
        setSelectedLine(lineId);
        setSelectedFile(filename);
        // setShowCommentForm(true);
    };
    
    const handleOverwriteClick = async (filename, conflict) => {
        const translations = {
            [filename] : {
                [conflict.label] : {
                    [conflict.language] : conflict.syncValue
                }
            }
        };
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
            setTimeout(() => window.location.reload(), 3000);
        } catch (error) {
            console.error('Error updating file:', error);
        }

    };
    return (
        <div>
            
            <div>
                {conflicts.length > 0 ? (
                    conflicts.map(item => (
                    <>
                        <h2>Conflicts</h2>
                        <div key={item.filename}>
                            <h3>{item.filename}</h3>
                            <table border="1">
                                <thead>
                                    <tr>
                                        <th>Label</th>
                                        <th>Language</th>
                                        <th>sync Value</th>
                                        <th> {sessionStorage.getItem("branch")} Value</th>
                                        <th>Overwrite in {sessionStorage.getItem("branch")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.conflicts.map(conflict => (
                                        <tr>
                                            <th>{conflict.label}</th>
                                            <th>{conflict.language}</th>
                                            <th>{conflict.syncValue}</th>
                                            <th>{conflict.branchValue}</th>
                                            <th>
                                                <button
                                                    onClick={() => handleOverwriteClick(item.filename, conflict)}
                                                    style={{ width: '99%', height: '50px'}}
                                                >
                                                    Overwrite
                                                </button>
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                    ))
                ) : (
                    <>
                        <h2>
                            <a href={`/${process.env.REACT_APP_REPO}/?pullnumber=${pullnumber}#/merge`}>
                                Merge pull request {pullnumber}
                            </a>
                        </h2>
                        <h3>No Conflict</h3>
                    </>
                )}
            </div>
            <h2>Diff with main branch</h2>
            {diffs.map((fileDiff, index) => (
                <div key={index}>
                    <h3>{fileDiff.filename}</h3>
                    <DiffViewer
                        oldValue={fileDiff.before}
                        newValue={fileDiff.after}
                        splitView={false}
                        showDiffOnly={true}
                        onLineNumberClick={(lineId, event) => handleLineNumberClick(lineId, event, fileDiff.filename)}
                    />
                    {comments
                        .filter(comment => comment.path === fileDiff.filename)
                        .map((comment, commentIndex) => {
                            const formattedDate = formatInTimeZone(comment.created_at, userTimeZone, 'dd/MM/yyyy HH:mm:ss');

                            return (
                                <div key={commentIndex}>
                                    <strong>Comment on line {comment.line} at {formattedDate}: </strong>{comment.body}
                                    <p></p>
                                </div>
                            );
                        })
                    }
                </div>
            ))}
            {showCommentForm && (
                <div className="comment-form-overlay">
                    <div className="comment-form-popup">
                        <h3>Add a comment for line {selectedLine} in file {selectedFile}</h3>
                        <textarea placeholder="Enter your comment"></textarea>
                        <div>
                            <button onClick={() => setShowCommentForm(false)}>Cancel</button>
                            <button>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Changed;