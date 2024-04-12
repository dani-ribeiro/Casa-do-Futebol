import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/previousGame.css';
import GameTop from './GameTop.js';
import LoadImage from "./LoadImage.js";

// Bootstrap Components -------------------------------------------------------
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function PreviousGame( {matchData} ) {
    const [matchStats, setMatchStats] = useState({});

    useEffect(() => {
        const fetchMatchStats = async () => {
            try {

                const response = await fetch(`/api/matches/previous/stats/${matchData.match_id}/${matchData.home_id}/${matchData.away_id}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch match statistics");
                }
                const data = await response.json();
                setMatchStats(data);
            }catch (error){
                console.error('ERROR: Failed to fetch match statistics', error);
            }
        };

        fetchMatchStats();
    }, [matchData]);

    return (
        <div id="previousGamePage">
            <div id='previousGamePage-contentHolder'>
                <GameTop gameType={'Previous'} matchData={matchData}/>
                <div id='previousGamePage-bottom'>
                    <Table id='previousGamePage-gameStats' borderless size='sm'>
                        <tbody>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>
                                    <LoadImage src={matchData.home_logo} alt={'Home Crest'} className='previousGamePage-teamStats-logo'/>
                                </td>
                                <td className='previousGamePage-teamStats-middle align-middle'>
                                    TEAM STATS
                                </td>
                                <td className='previousGamePage-teamStats align-middle'>
                                    <LoadImage src={matchData.away_logo} alt={'Away Crest'} className='previousGamePage-teamStats-logo'/>
                                </td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.total_shots}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Shots</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.total_shots}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.shots_on_target}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Shots On Target</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.shots_on_target}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.possession}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Possession</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.possession}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.total_passes}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Passes</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.total_passes}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.pass_accuracy}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Pass Accuracy</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.pass_accuracy}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.fouls}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Fouls</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.fouls}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.yellows}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Yellow Cards</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.yellows}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.reds}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Red Cards</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.reds}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.offsides}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Offsides</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.offsides}</td>
                            </tr>
                            <tr>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.home?.corners}</td>
                                <td className='previousGamePage-teamStats-middle align-middle'>Corners</td>
                                <td className='previousGamePage-teamStats align-middle'>{matchStats?.away?.corners}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
  }


export default PreviousGame;