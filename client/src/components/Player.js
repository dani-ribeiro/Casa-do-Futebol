import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/player.css';
// Bootstrap Components -------------------------------------------------------

// ----------------------------------------------------------------------------

function Player( {name, playerData} ) {
    const playerName = name;
    const photo = playerData.photo;

    return (
        <div className='teamPage-playerBox'>
            <img src={photo} className='teamPage-playerImg' alt='Player'/>
            <p className='teamPage-playerName'>{playerName}</p>
        </div>
    );
  }


export default Player;