import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBarTOP from './components/NavBarTOP.js';
import SignUp from './components/SignUp.js';
import LeagueStandings from './components/LeagueStandings.js';

// Bootstrap Components -------------------------------------------------------

// ----------------------------------------------------------------------------

function App() {
  const [currentView, setCurrentView] = useState('Sign Up');

  return (
    <div className="App">
        <NavBarTOP setCurrentView={setCurrentView}/>
        {/* Render Page View */}
        { currentView === 'League Standings' ? (<LeagueStandings />) : 
          currentView === 'Sign Up' ? ( <SignUp setCurrentView={setCurrentView} />) : null}
    </div>
  );
}

export default App;
