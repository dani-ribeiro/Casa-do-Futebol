import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/upcomingGamePage.css';
import GameTop from './GameTop.js';

function UpcomingGame( {setCurrentView, setShowBetModal, loggedIn, matchData} ) {
    const [headToHeads, setHeadToHeads] = useState({});

    useEffect(() => {
        const fetchHeadToHeads = async () => {
            try {
                const response = await fetch(`/api/matches/h2h/${matchData.home_id}/${matchData.away_id}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch head to head encounters");
                }
                const data = await response.json();
                setHeadToHeads(data);
            }catch (error){
                console.error('ERROR: Failed to fetch head to head encounters', error);
            }
        };

        fetchHeadToHeads();
    }, [matchData, headToHeads]);

    return (
        <div id="upcomingGamePage">
            <div id='upcomingGamePage-contentHolder'>
                <GameTop gameType={'Upcoming'} matchData={matchData} setShowBetModal={setShowBetModal} loggedIn={loggedIn} />
                <div id='upcomingGamePage-bottom'>
                    <h2>HEAD-TO-HEADS</h2>
                    <hr></hr>
                    {Object.values(headToHeads).map((headToHead, index) => (
                        <GameTop key={index} gameType={'Head-to-Head'} matchData={headToHead} setCurrentView={setCurrentView}/>
                    ))}
                </div>
            </div>
        </div>
    );
  }


export default UpcomingGame;