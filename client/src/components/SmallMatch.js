import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/smallMatch.css';
// Bootstrap Components -------------------------------------------------------

// ----------------------------------------------------------------------------

function SmallMatch( {matchID, matchData} ){
    console.log(matchData);
    

    return (
        <div className='small-match'>
            <div className='small-match-team'>
                <img src={matchData.home_logo}  className='small-match-teamLogo' alt='Team Crest'/>
                <p>{matchData.home_team}</p>
            </div>
            {matchData.status === 'FT' ? (
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
            {matchData.status === 'FT' ? (
                <>
                <div  className='small-match-home-score small-match-score'>
                    <h4>{matchData.away_score}</h4>
                </div>
                </>
            ): null}
            <div className='small-match-team'>
                <img src={matchData.away_logo}  className='small-match-teamLogo' alt='Team Crest'/>
                <p>{matchData.away_team}</p>
            </div>
        </div>
    );
  }

export default SmallMatch;