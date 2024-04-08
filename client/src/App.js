import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBarTOP from './components/NavBarTOP.js';
import ShowChangeModal from './components/ShowChangeModal.js';
import SignUp from './components/SignUp.js';
import Login from './components/Login.js';
import LeagueStandings from './components/LeagueStandings.js';
import Team from './components/Team.js';

// Bootstrap Components -------------------------------------------------------

// ----------------------------------------------------------------------------

function App() {
  const [currentView, setCurrentView] = useState( {page: 'League Standings', data: null} );
  const [loggedIn, setLoggedIn] = useState( {status: false, username: ''});
  const [showChangeModal, setShowChangeModal] = useState(false);

  return (
    <div className="App">
        <NavBarTOP setCurrentView={setCurrentView} loggedIn={loggedIn} setLoggedIn={setLoggedIn} showChangeModal={showChangeModal} setShowChangeModal={setShowChangeModal}/>
        {/* Render Page View */}
        { currentView.page === 'League Standings' ? (<LeagueStandings setCurrentView={setCurrentView} />) : 
          currentView.page === 'Sign Up' ? ( <SignUp setCurrentView={setCurrentView} setLoggedIn={setLoggedIn} />) :
          currentView.page === 'Log In' ? ( <Login setCurrentView={setCurrentView} setLoggedIn={setLoggedIn} />):
          // temporary
          currentView.page === 'Team' ? (
             <Team setCurrentView={setCurrentView} teamData={currentView.data} />
             )
          
          : null

        }

        

      {loggedIn.status && <ShowChangeModal showChangeModal={showChangeModal} setShowChangeModal={setShowChangeModal} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}
    </div>
  );
}

export default App;
