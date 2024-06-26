import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBarTOP from './components/NavBarTOP.js';
import ShowChangeModal from './components/ShowChangeModal.js';
import SignUp from './components/SignUp.js';
import Login from './components/Login.js';
import LeagueStandings from './components/LeagueStandings.js';
import Team from './components/Team.js';
import PlayerPage from './components/PlayerPage.js';
import PreviousGame from './components/PreviousGame.js';
import UpcomingGame from './components/UpcomingGame.js';
import ShowBetModal from './components/ShowBetModal.js';
import Leaderboard from './components/Leaderboard.js';
import OngoingGame from './components/OngoingGame.js';
import io from 'socket.io-client';
const socket = io('http://localhost:3000');

function App() {
  const [currentView, setCurrentView] = useState( {page: 'League Standings', data: null} );
  const [loggedIn, setLoggedIn] = useState( {status: false, username: '', points: 0});
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showBetModal, setShowBetModal] = useState( { show: false, data: null} );

  // checks if user is logged in (maintains log in after refresh)
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const points = parseFloat(sessionStorage.getItem('points'));
    const userID = sessionStorage.getItem('userID');

    if(token){
        setLoggedIn({ status: true, username, points, userID});
    }
}, [loggedIn.status, loggedIn.username, loggedIn.points]);

  // asynchronously updates points
  useEffect(() => {
    socket.on('update_points', function(points){
      console.log('received: ', points);
      points = parseFloat(points);
      setLoggedIn((prevLoggedIn) => ({
        ...prevLoggedIn,
        points: points
      }));
      sessionStorage.setItem('points', points);
    });
  }, []);

  return (
    <div className="App">
        <NavBarTOP setCurrentView={setCurrentView} loggedIn={loggedIn} setLoggedIn={setLoggedIn} setShowChangeModal={setShowChangeModal}/>
        {/* Render Page View */}
        { currentView.page === 'League Standings' ? (<LeagueStandings setCurrentView={setCurrentView} />) : 
          currentView.page === 'Sign Up' ? ( <SignUp setCurrentView={setCurrentView} setLoggedIn={setLoggedIn} socket={socket} />) :
          currentView.page === 'Log In' ? ( <Login setCurrentView={setCurrentView} setLoggedIn={setLoggedIn} socket={socket} />):
          currentView.page === 'Team' ? (<Team setCurrentView={setCurrentView} teamData={currentView.data} />):
          currentView.page === 'Player' ? (<PlayerPage playerData={currentView.data.playerData} season={currentView.data.season} teamLogo={currentView.data.teamLogo} />):
          currentView.page === 'Previous Game' ? (<PreviousGame setCurrentView={setCurrentView} matchData={currentView.data} />):
          currentView.page === 'Upcoming Game' ? (<UpcomingGame setCurrentView={setCurrentView} matchData={currentView.data} setShowBetModal={setShowBetModal} loggedIn={loggedIn} />):
          currentView.page === 'Leaderboard' ? (<Leaderboard setCurrentView={setCurrentView} loggedIn={loggedIn}/>):
          currentView.page === 'Ongoing Game' ? (<OngoingGame setCurrentView={setCurrentView} matchData={currentView.data}/>)
          : null
        }
      
      {/* Additional Renders: Change username modal, and Betting modal */}
      {loggedIn.status && <ShowChangeModal showChangeModal={showChangeModal} setShowChangeModal={setShowChangeModal} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}
      {showBetModal.show && <ShowBetModal showBetModal={showBetModal.show} matchData={showBetModal.data} setShowBetModal={setShowBetModal} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}
    </div>
  );
}

export default App;
