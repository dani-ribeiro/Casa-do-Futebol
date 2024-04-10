import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/game.css';
import LoadImage from "./LoadImage.js";

// Bootstrap Components -------------------------------------------------------
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function Game( {setCurrentView} ) {

    return (
        <div id="gamePage">
            <div id='gamePage-contentHolder'>
                <div id='gamePage-top'>
                    <h5>August 12, 2024</h5>
                    <h5>Full-time</h5>
                </div>
                <div id='gamePage-mid'>
                    <div id='gamePage-midTop'>
                        <div className='gamePage-teamBox'>
                            <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Santos_logo.svg/2090px-Santos_logo.svg.png' className='gamePage-teamLogo' alt='default'></img>
                            <h2>Santos</h2>
                        </div>
                        <div id='gamePage-gameScore'>
                            <h1 id='gamePage-homeScore' className='gamePage-score'>3</h1>
                            <h1 id='gamePage-hyphen' className='gamePage-score'>⎯</h1>
                            <h1 id='gamePage-awayScore' className='gamePage-score'>4</h1>
                        </div>
                        <div className='gamePage-teamBox'>
                            <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg/1200px-Botafogo_de_Futebol_e_Regatas_logo.svg.png' className='gamePage-teamLogo' alt='default'></img>
                            <h2>Botafogo</h2>
                        </div>
                    </div>
                    <div id='gamePage-midBottom'>
                        <div className='gamePage-timeline' id='gamePage-timeline-left'>
                            <div className='gamePage-timelineEvent'>
                                <div className='gamePage-timelineIcon'>
                                    <img src='/images/yellow-card.png' alt='yellow card'></img>
                                </div>
                                <p className='gamePage-timelineDescription'>Ribeiro 5'</p>
                            </div>
                            <div className='gamePage-timelineEvent'>
                                <div className='gamePage-timelineIcon'>
                                    <img src='/images/yellow-card.png' alt='yellow card'></img>
                                </div>
                                <p className='gamePage-timelineDescription'>Ribeiro 5'</p>
                            </div>
                            <div className='gamePage-timelineEvent'>
                                <div className='gamePage-timelineIcon'>
                                    <img src='/images/yellow-card.png' alt='yellow card'></img>
                                </div>
                                <p className='gamePage-timelineDescription'>Ribeiro 5'</p>
                            </div>
                        </div>
                        <div className='gamePage-timeline' id='gamePage-timeline-right'>
                            <div className='gamePage-timelineEvent'>
                                <div className='gamePage-timelineIcon'>
                                    <img src='/images/goal.svg' alt='penalty'></img>
                                    <p>(P)</p>
                                </div>
                                <p className='gamePage-timelineDescription'>Fereira 30'</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id='gamePage-bottom'>
                    
                </div>
            </div>
        </div>
    );
  }


export default Game;