import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { formatInTimeZone } from 'date-fns-tz';
import { useNavigate } from 'react-router-dom';

const Changed = () => {
    const [diffs, setDiffs] = useState([]);
    const [comments, setComments] = useState([]);
    const [pullnumber, setPullnumber] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uptodate, setUptodate] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null); // Nouvel état pour le fichier sélectionné
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionStorage.getItem("github_token")) {
            navigate('/');
        }
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/github/changed`, {
                    params: {
                        repo: process.env.REACT_APP_REPO
                    },
                        headers: {
                        'Authorization': sessionStorage.getItem("github_token")
                    }
                });

                if (response.data.compare) {
                    setUptodate(true);
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
    if (uptodate) {
        return <div>Pas de nouveau commit</div>;
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleLineNumberClick = (lineId, event, filename) => {
        setSelectedLine(lineId);
        setSelectedFile(filename);
        setShowCommentForm(true);
    };

    return (
        <div>
            <h2>
                <a href={`/${process.env.REACT_APP_REPO}/?pullnumber=${pullnumber}#/merge`}>
                    Merge pull request {pullnumber}
                </a>
            </h2>
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