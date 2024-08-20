// App.js
import React from 'react';
import { Routes, Route, HashRouter, Link} from 'react-router-dom';
import Login from './components/Login';
import Callback from './components/Callback';
import Collection from './components/Collection';
import Display from './components/Display';
import Translate from './components/Translate';
import Update from './components/Update';
import Changed from './components/Changed';
import Merge from './components/Merge';

// const repoPath = process.env.REACT_APP_REPO || '';

const App = () => {
  return (
    <HashRouter >
      <ul>
        <li><Link to="/collection">Collection</Link></li>
        <li><Link to="/changed">Changed</Link></li>
      </ul>
      <Routes>
        <Route exact path={`/callback`} element={<Callback />} />
        <Route exact path={`/collection`} element={<Collection />} />
        <Route exact path={`/display`} element={<Display />} />
        <Route exact path={`/translate`} element={<Translate />} />
        <Route exact path={`/update`} element={<Update />} />
        <Route exact path={`/changed`} element={<Changed />} />
        <Route exact path={`/merge`} element={<Merge />} />
        <Route exact path={`/`} element={<Login />} />
        {/* <Route path={`${repoPath}/`} element={<Login />} /> */}
        {/* <Route path={`${repoPath}/callback`} element={<Callback />} />
        <Route path={`${repoPath}/collection`} element={<Collection />} />
        <Route path={`${repoPath}/display`} element={<Display />} />
        <Route path={`${repoPath}/translate`} element={<Translate />} />
        <Route path={`${repoPath}/update`} element={<Update />} />
        <Route path={`${repoPath}/merge`} element={<Merge />} />
        <Route path={`${repoPath}/changed`} element={<Changed />} /> */}
      </Routes>
    </HashRouter >
  );
};

export default App;