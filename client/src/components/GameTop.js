import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/gameTop.css';
import PreviousMatchEvents from './PreviousMatchEvents.js';
import LoadImage from "./LoadImage.js";
// Bootstrap Components -------------------------------------------------------
import Button from 'react-bootstrap/Button';
// ----------------------------------------------------------------------------

function GameTop( {setCurrentView, setShowBetModal, loggedIn, gameType, matchData} ) {
    const [basicMatchData, setBasicMatchData] = useState({});

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

    function handleMatchClick(matchData){
        if(gameType === 'Head-to-Head'){
            setCurrentView( { page: 'Previous Game', data: matchData });
        }
    }

    function handleBetClick(){
        setShowBetModal({
                            show: true,
                            data: matchData
                        });
    }

    return (
        <div id='gameTop-contentHolder' onClick={() => handleMatchClick(matchData)}>
            <div id='gameTop-top'>
                <h5>{basicMatchData.date}, {basicMatchData.time}</h5>
                <h5>{basicMatchData.status}</h5>
            </div>
            <div id='gameTop-mid'>
                <div id='gameTop-midTop'>
                    <div className='gameTop-teamBox'>
                        <LoadImage src={basicMatchData.home_logo} alt={'Home Crest'} className={'gameTop-teamLogo'}/>
                        <h2>{basicMatchData.home_team}</h2>
                    </div>
                    <div id='gameTop-gameScore'>
                        {loggedIn?.status && gameType === 'Upcoming' && (
                            <Button className='initializeBet' onClick={() => handleBetClick()}>PLACE BET</Button>
                        )}
                        {!loggedIn?.status && gameType === 'Upcoming' && (
                            <h1 id='gameTop-hyphen' className='gameTop-score'>X</h1>
                        )}
                        {gameType !== 'Upcoming' && (
                            <>
                                <h1 id='gameTop-homeScore' className='gameTop-score'>{basicMatchData.home_score}</h1>
                                <h1 id='gameTop-hyphen' className='gameTop-score'>⎯</h1>
                                <h1 id='gameTop-awayScore' className='gameTop-score'>{basicMatchData.away_score}</h1>
                            </>
                        )}
                    </div>
                    <div className='gameTop-teamBox'>
                        <LoadImage src={basicMatchData.away_logo} alt={'Away Crest'} className={'gameTop-teamLogo'}/>
                        <h2>{basicMatchData.away_team}</h2>
                    </div>
                </div>
                {gameType === 'Previous' ? (
                    <PreviousMatchEvents matchData={ {
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