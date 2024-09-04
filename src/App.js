// App.js
import React from 'react';
import { Routes, Route, HashRouter} from 'react-router-dom';
import Login from './components/Login';
import Callback from './components/Callback';
import Translate from './components/Translate';
// import Update from './components/Update';
import Changed from './components/Changed';
import Merge from './components/Merge';
import Branches from './components/Branches';
import NavBar from './components/NavBar';
import './App.css'


const App = () => {
  return (
    <HashRouter >
      <NavBar />
      <div className='App'>
        <Routes>
            <Route exact path={`/callback`} element={<Callback />} />
            <Route exact path={`/branches`} element={<Branches />} />
            <Route exact path={`/translate`} element={<Translate />} />
            {/* <Route exact path={`/update`} element={<Update />} /> */}
            <Route exact path={`/changed`} element={<Changed />} />
            <Route exact path={`/merge`} element={<Merge />} />
            <Route path={`/`} element={<Login />} />
        </Routes>
      </div>
    </HashRouter >
  );
};

export default App;