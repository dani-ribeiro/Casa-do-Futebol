import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/playerPage.css';
import LoadImage from "./LoadImage.js";

// Bootstrap Components -------------------------------------------------------
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function PlayerPage( {setCurrentView, playerData, season, teamLogo} ) {
    const [player, setPlayer] = useState({});

    useEffect(() => {
        const fetchPlayer = async () => {
            if(playerData.player_id && season){
                try {
                    const response = await fetch(`/api/player/${playerData.player_id}/${season}`);
                    if(!response.ok){
                        throw new Error("ERROR: Unable to fetch player information");
                    }
                    const data = await response.json();
                    setPlayer(data);
                } catch(error){
                    console.error('ERROR: Unable to fetch player information', error);
                }
            }
        };
        
        fetchPlayer();
    }, [playerData, season]);

    // re-assign player position
    useEffect( () => {
        if(playerData.position === 'Attacker'){
            playerData.position = 'ATTACK';
        }else if(playerData.position === 'Midfielder'){
            playerData.position = 'MIDFIELD';
        }else if(playerData.position === 'Defender'){
            playerData.position = 'DEFENSE'
        }else if(playerData.position === 'Goalkeeper'){
            playerData.position = 'GOALKEEPER'
        }
    }, [playerData]);

    return (
        <div id="playerPage">
            <div id='playerPage-contentHolder'>
                <div id='playerPage-top'>
                    <div id='playerPage-topLeft'>
                        <LoadImage src={playerData.photo} className={''} id={'playerPage-playerImage'} alt={'Salah'}/>
                        <div id='playerPage-playerMid'>
                            <h3 id='playerPage-firstName'>{player?.firstName}</h3>
                            <h3 id='playerPage-lastName'>{player?.lastName}</h3> {/* bold */}
                            <div id='playerPage-smallInfo'>
                                <div id='playerPage-team'>
                                    <LoadImage src={teamLogo} className={'playerPage-smallLogo'} id={''} alt={'Liverpool'}/>
                                    <p>{player?.team}</p>
                                </div>
                                <div id='playerPage-midInfo'>
                                    <p className='playerPage-dot'>•</p>
                                    <p id='playerPage-number'>#{playerData.number}</p>
                                    <p className='playerPage-dot'>•</p>
                                    <p id='playerPage-position'>{player?.position}</p>
                                    {player?.captain &&
                                        <p className='playerPage-dot'>•</p>
                                    }
                                </div>
                                {player?.captain &&
                                    <img className='playerPage-smallLogo' src='/images/captain.png' alt='Captain'></img>
                                }
                            </div>
                        </div>
                    </div>
                    <div id='playerPage-topRight'>
                    <Table borderless id='playerPage-playerPersonal-table'>
                        <tbody>
                            <tr>
                                <th>HT/WT:</th>
                                <td>{player?.height}, {player?.weight}</td>
                            </tr>
                            <tr>
                                <th>Birthdate:</th>
                                <td>{player?.birthday} ({playerData.age})</td>
                            </tr>
                            <tr>
                                <th>Nationality:</th>
                                <td>{player?.nationality}</td>
                            </tr>
                        </tbody>
                    </Table>
                    </div>
                </div>
                <hr></hr>
                <div id='playerPage-bottom'>
                    <div id='playerPage-statsHolder'>
                        <div id='playerPage-statsTitle'>
                            <h2>STATISTICS</h2>
                            <hr/>
                        </div>
                        <div id='playerPage-statsBackground'>
                            <div className='playerPage-statsBox'>
                                <div className='playerPage-statTop' id='playerPage-statTop-general'>
                                    <h4>GENERAL</h4>
                                    <hr></hr>
                                    <div id='playerPage-ratingBox'>
                                        <h3 id='playerPage-rating'>{player?.all_positions?.rating}</h3>
                                        <h6>Overall Rating</h6>
                                    </div>
                                </div>
                                {/* GENERAL STATISTICS */}
                                <Table className='playerPage-statTable' borderless size='sm'>
                                    <tbody>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.appearances}</p></th>
                                            <td>Appearances</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.minutes}</p></th>
                                            <td>Minutes</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.totalPasses}</p></th>
                                            <td>Total Passes</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.keyPasses}</p></th>
                                            <td>Key Passes</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.passAccuracy}%</p></th>
                                            <td>Pass Accuracy</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.foulsDrawn}</p></th>
                                            <td>Fouls Drawn</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.foulsCommitted}</p></th>
                                            <td>Fouls Committed</td>
                                        </tr>
                                        <tr>
                                            <th className='playerPage-stat playerPageCard'>
                                                <div className='playerPage-totalCards'>
                                                    <div className='playerPage-cards'>
                                                        <img className='teamPage-cardImg' src='./images/yellow-card.png' alt='Red Cards'></img>
                                                        <p className='playerPage-cardCount'>{player?.all_positions?.yellowCards}</p>
                                                    </div>
                                                    <div className='playerPage-cards'>
                                                        <img className='teamPage-cardImg' src='./images/red-card.png' alt='Red Cards'></img>
                                                        <p className='playerPage-cardCount'>{player?.all_positions?.redCards}</p>
                                                    </div>
                                                </div>
                                            </th>
                                            <td>Cards</td>
                                        </tr>
                                        <tr>
                                            <th><p className='playerPage-stat'>{player?.all_positions?.duelsWon}</p></th>
                                            <td>Duels Won</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                            <div className='playerPage-statsBox' id='playerPage-statsRight'>
                                <div className='playerPage-statTop playerPage-positionTop'>
                                    <h4>{playerData.position}</h4>
                                    <hr></hr>
                                </div>
                                {/* GENERAL STATISTICS */}
                                <Table className='playerPage-statTable' borderless size='sm'>
                                    <tbody>
                                        {playerData.position === 'GOALKEEPER' ? 
                                            <>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.goalkeeper?.conceded}</p></th>
                                                    <td>Goals Conceded</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.goalkeeper?.saved}</p></th>
                                                    <td>Goals Saved</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.goalkeeper?.penalty_comitted}</p></th>
                                                    <td>Penalties Committed</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.goalkeeper?.penalty_saved}</p></th>
                                                    <td>Penalties Saved</td>
                                                </tr>
                                            </>
                                        :
                                        playerData.position === 'DEFENSE' ?
                                        <>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.defender?.goals}</p></th>
                                                <td>Goals</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.defender?.conceded}</p></th>
                                                <td>Own Goals</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.defender?.assists}</p></th>
                                                <td>Assists</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.defender?.tackles}</p></th>
                                                <td>Tackles</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.defender?.penalty_committed}</p></th>
                                                <td>Penalties Committed</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.defender?.penalties_converted}</p></th>
                                                <td>Penalties Converted</td>
                                            </tr>
                                        </>
                                        :
                                        playerData.position === 'MIDFIELD' ?
                                            <>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.goals}</p></th>
                                                    <td>Goals</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.conceded}</p></th>
                                                    <td>Own Goals</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.assists}</p></th>
                                                    <td>Assists</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.shots}</p></th>
                                                    <td>Shots On Target</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.dribbles}</p></th>
                                                    <td>Successful Dribbles</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.penalty_committed}</p></th>
                                                    <td>Penalties Committed</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.penalty_drawn}</p></th>
                                                    <td>Penalties Awarded</td>
                                                </tr>
                                                <tr>
                                                    <th><p className='playerPage-stat'>{player?.midfielder?.penalties_converted}</p></th>
                                                    <td>Penalties Converted</td>
                                                </tr>
                                            </>
                                        :
                                        playerData.position === 'ATTACK' ?
                                        <>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.attacker?.goals}</p></th>
                                                <td>Goals</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.attacker?.assists}</p></th>
                                                <td>Assists</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.attacker?.shots}</p></th>
                                                <td>Shots On Target</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.attacker?.dribbles}</p></th>
                                                <td>Successful Dribbles</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.attacker?.penalty_drawn}</p></th>
                                                <td>Penalties Awarded</td>
                                            </tr>
                                            <tr>
                                                <th><p className='playerPage-stat'>{player?.attacker?.penalties_converted}</p></th>
                                                <td>Penalties Converted</td>
                                            </tr>
                                        </>
                                        :
                                        null
                                    }
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }


export default PlayerPage;