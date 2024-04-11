import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/smallMatch.css';
import LoadImage from './LoadImage.js';
// Bootstrap Components -------------------------------------------------------

// ----------------------------------------------------------------------------

function SmallMatch( {setCurrentView, matchData} ){

    function handleMatchClick(matchData){
        setCurrentView( { page: 'Previous Game', data: matchData });
    }

    return (
        <div className='small-match' onClick={() => handleMatchClick(matchData)}>
            <div className='small-match-team'>
                <LoadImage src={matchData.home_logo} alt={matchData.home_team} className={'small-match-teamLogo'} id={''}/>
                <p>{matchData.home_team}</p>
            </div>
            {matchData.status === 'FT' || matchData.status === 'PEN' || matchData.status === 'AET' ? (
                <>
                <div  className='small-match-home-score small-match-score'>
                    <h4>{matchData.home_score}</h4>
                </div>
                </>
            ): null}
            <div className='small-match-info'>
                <p className='small-match-info-date'>{matchData.date}</p>
                <p className='small-match-info-time'>{matchData.time}</p>
            </div>
            {matchData.status === 'FT' || matchData.status === 'PEN' || matchData.status === 'AET' ? (
                <>
                <div  className='small-match-home-score small-match-score'>
                    <h4>{matchData.away_score}</h4>
                </div>
                </>
            ): null}
            <div className='small-match-team'>
                <LoadImage src={matchData.away_logo} alt={matchData.away_team} className={'small-match-teamLogo'} id={''}/>
                <p>{matchData.away_team}</p>
            </div>
        </div>
    );
  }

export default SmallMatch;