import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/gameTop.css';
import MatchEvents from './MatchEvents';
// import LoadImage from "./LoadImage.js";

// Bootstrap Components -------------------------------------------------------
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function GameTop( {setCurrentView, gameType, matchData} ) {
    const [basicMatchData, setBasicMatchData] = useState({});
    const [matchEvents, setMatchEvents] = useState({});

    useEffect(() => {
        let gameStatus;
        switch (matchData.status) {
            case 'FT':
                gameStatus = 'Full-time';
                break;
            case 'PEN':
                gameStatus = 'Full-time + Penalties';
                break;
            case 'AET':
                gameStatus = 'Full-time + Extra Time';
                break;
            case 'NS':
                gameStatus = 'Not Started';
                break;
            default:
                gameStatus = 'N/A';
                break;
        }
        setBasicMatchData( {
            ...matchData,
            status: gameStatus
        });

    }, [matchData]);

    return (
        <div id='gameTop-contentHolder'>
            <div id='gameTop-top'>
                <h5>{basicMatchData.date}, {basicMatchData.time}</h5>
                <h5>{basicMatchData.status}</h5>
            </div>
            <div id='gameTop-mid'>
                <div id='gameTop-midTop'>
                    <div className='gameTop-teamBox'>
                        <img src={basicMatchData.home_logo} className='gameTop-teamLogo' alt='default'></img>
                        <h2>{basicMatchData.home_team}</h2>
                    </div>
                    <div id='gameTop-gameScore'>
                        <h1 id='gameTop-homeScore' className='gameTop-score'>{basicMatchData.home_score}</h1>
                        <h1 id='gameTop-hyphen' className='gameTop-score'>⎯</h1>
                        <h1 id='gameTop-awayScore' className='gameTop-score'>{basicMatchData.away_score}</h1>
                    </div>
                    <div className='gameTop-teamBox'>
                        <img src={basicMatchData.away_logo} className='gameTop-teamLogo' alt='default'></img>
                        <h2>{basicMatchData.away_team}</h2>
                    </div>
                </div>
                {gameType === 'Previous' ? (
                    <MatchEvents matchData={ {
                                                match_id:   basicMatchData.match_id,
                                                home_id:    basicMatchData.home_id,
                                                away_id:    basicMatchData.away_id
                                             }} 
                    />
                    ): null
                    }
            </div>
        </div>
    );
  }


export default GameTop;