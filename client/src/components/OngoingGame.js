import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/ongoingGame.css';
import GameTop from './GameTop.js';
import LoadImage from "./LoadImage.js";
// Bootstrap Components -------------------------------------------------------
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function OngoingGame( {setCurrentView, matchData} ) {
    const [matchStats, setMatchStats] = useState({});
    const [matchEvents, setMatchEvents] = useState({});

    // fetches match details while a game is ongoing
    useEffect(() => {
            const fetchOngoingMatch = async () => {
                // if the game is paused (half-time), or completed (full-time), don't fetch details since there's nothing new
                if(matchData.status !== 'HT' && matchData.status !== 'FT'){
                    try {
                        const response = await fetch(`/api/matches/ongoing/${matchData.match_id}/${matchData.home_id}/${matchData.away_id}`);
                        if (!response.ok) {
                            throw new Error("ERROR: Failed to fetch ongoing match");
                        }
                        const data = await response.json();
                        setMatchStats(data.stats);
                        setMatchEvents(data.events);
                        matchData.status = data.other.status;
                        matchData.time_elapsed = data.other.time_elapsed;
                    }catch (error){
                        console.error('ERROR: Failed to fetch ongoing match', error);
                    }
                };
            }
            fetchOngoingMatch();

            // fetch ongoing game statistics every minute
            const intervalID = setInterval(fetchOngoingMatch, 60000);

            return () => clearInterval(intervalID);
    }, [matchData]);

    return (
        <div id="ongoingGamePage">
            <div id='ongoingGamePage-contentHolder'>
                <GameTop setCurrentView={setCurrentView} gameType={'Ongoing'} matchData={matchData} ongoingMatchEvents={matchEvents}/>
                <div id='ongoingGamePage-bottom'>
                    <Table id='ongoingGamePage-gameStats' borderless size='sm'>
                        <tbody>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>
                                    <LoadImage src={matchData.home_logo} alt={'Home Crest'} className='ongoingGamePage-teamStats-logo'/>
                                </td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>
                                    TEAM STATS
                                </td>
                                <td className='ongoingGamePage-teamStats align-middle'>
                                    <LoadImage src={matchData.away_logo} alt={'Away Crest'} className='ongoingGamePage-teamStats-logo'/>
                                </td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.total_shots}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Shots</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.total_shots}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.shots_on_target}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Shots On Target</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.shots_on_target}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.possession}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Possession</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.possession}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.total_passes}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Passes</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.total_passes}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.pass_accuracy}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Pass Accuracy</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.pass_accuracy}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.fouls}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Fouls</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.fouls}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.yellows}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Yellow Cards</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.yellows}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.reds}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Red Cards</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.reds}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.offsides}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Offsides</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.offsides}</td>
                            </tr>
                            <tr>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.home?.corners}</td>
                                <td className='ongoingGamePage-teamStats-middle align-middle'>Corners</td>
                                <td className='ongoingGamePage-teamStats align-middle'>{matchStats?.away?.corners}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
  }

export default OngoingGame;