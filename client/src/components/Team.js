import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/team.css';

import SmallMatch from './SmallMatch';
import Player from './Player';

// Bootstrap Components -------------------------------------------------------
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function Team( {setCurrentView, teamData} ) {
    const { leagueID, season, teamID } = teamData;

    const [teamContent, setTeamContent] = useState({});
    const [formationsLines, setFormationsLines] = useState([]);
    const [playersList, setPlayersList] = useState([]);
    const [upcomingMatchesList, setUpcomingMatches] = useState([]);
    const [previousMatchesList, setPreviousMatches] = useState([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(`/api/team/${leagueID}/${season}/${teamID}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch team information");
                }
                const data = await response.json();
                setTeamContent(data);

                // reformats formations such that maximum 3 formations per line
                const formationsArray = data.formations.split(',');
                const lines = [];
                let currentLine = [];
                formationsArray.forEach(formation => {
                    if(currentLine.length === 3){
                        lines.push(currentLine);
                        currentLine = [];
                    }
                    if(formation.trim() !== ''){
                        currentLine.push(formation.trim());
                    }
                });
                if(currentLine.length > 0){
                    lines.push(currentLine);
                }
                setFormationsLines(lines);
            }catch (error){
                console.error('ERROR: Failed to fetch team information', error);
            }
        };

        fetchTeam();
    }, [leagueID, season, teamID]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch(`/api/players/${leagueID}/${season}/${teamID}`);
                if (!response.ok) {
                    throw new Error('ERROR: Failed to fetch players');
                }
                const data = await response.json();
                setPlayersList(data);
            }catch (error){
                console.error("ERROR: Failed to fetch players", error);
            }
        };

        fetchPlayers();
    }, [leagueID, season, teamID]);

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const response = await fetch(`/api/fixtures/${season}/${teamID}`);
                if (!response.ok) {
                    throw new Error('ERROR: Failed to fetch fixtures');
                }
                const data = await response.json();
                setUpcomingMatches(Object.values(data.upcoming));
                setPreviousMatches(Object.values(data.previous));
            }catch (error){
                console.error("ERROR: Failed to fetch fixtures", error);
            }
        };

        fetchFixtures();
    }, [leagueID, season, teamID]);

    // for debugging
    useEffect(() => {
        console.log(teamContent);
        console.log(playersList);
        console.log("upcoming");
        console.log(upcomingMatchesList);
        console.log("previous");
        console.log(previousMatchesList);
    }, [teamContent, playersList, upcomingMatchesList, previousMatchesList]);


    return (
        <div id='teamPage'>
            <Container fluid id='team-background'>
                <div id='teamPage-left'>
                    <div id='teamPage-basicHolder'>
                        <img className='teamPage-teamLogo' src={teamContent.teamLogo} alt='Team Crest'/>
                        <div id='teamPage-teamInfo'>
                            <div className='teamPage-team-information'>
                                <h2 id='teamPage-teamName'>{teamContent.teamName}</h2>
                                <h5 id='teamPage-league'>{teamContent.league}</h5>
                            </div>
                        </div>
                        <Table id='teamPage-statsTable' hover>
                            <thead className="table-head">
                                <tr>
                                    <th>MP</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>GF</th>
                                    <th>GA</th>
                                    <th>GD</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id='teamPage-matchesPlayed'>{teamContent.matchesPlayed}</td>
                                    <td id='teamPage-wins'>{teamContent.wins}</td>
                                    <td id='teamPage-draws'>{teamContent.draws}</td>
                                    <td id='teamPage-losses'>{teamContent.loses}</td>
                                    <td id='teamPage-goalsFor'>{teamContent.goalsFor}</td>
                                    <td id='teamPage-goalsAgainst'>{teamContent.goalsAgainst}</td>
                                    <td id='teamPage-goalDiff'>{teamContent.goalDiff}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div id='teamPage-statsHolder'>
                        <h2>Statistics</h2>
                        <Table id='teamPage-stats' bordered hover size='sm'>
                            <tbody>
                                <tr>
                                    <td>Average Goals Per Game</td>
                                    <td id='teamPage-avgGG'>{teamContent.averageGoals}</td>
                                </tr>
                                <tr>
                                    <td>Best Win</td>
                                    <td id='teamPage-bestWin'>{teamContent.bestWin}</td>
                                </tr>
                                <tr>
                                    <td>Worst Loss</td>
                                    <td id='teamPage-bestLoss'>{teamContent.worstLoss}</td>
                                </tr>
                                <tr>
                                    <td>Clean Sheets</td>
                                    <td id='teamPage-cleanSheets'>{teamContent.cleanSheets}</td>
                                </tr>
                                <tr>
                                    <td>Failed To Score</td>
                                    <td id='teamPage-failedScore'>{teamContent.failedScore}</td>
                                </tr>
                                <tr>
                                    <td>Total Cards</td>
                                    <td>
                                        <div id='teamPage-totalCards'>
                                            <div className='teamPage-cards'>
                                                <img className='teamPage-cardImg' src='./images/yellow-card.png' alt='Red Cards'></img>
                                                <p className='teamPage-cardCount'>{teamContent.yellowCards}</p>
                                            </div>
                                            <div className='teamPage-cards'>
                                                <img className='teamPage-cardImg' src='./images/red-card.png' alt='Red Cards'></img>
                                                <p className='teamPage-cardCount'>{teamContent.redCards}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Longest Win Streak</td>
                                    <td id='teamPage-winStreak'>{teamContent.longestWinStreak}</td>
                                </tr>
                                <tr>
                                    <td>Formations Played</td>
                                    <td id='teamPage-formations'>
                                        {formationsLines.map((line, index) => (
                                            <div key={index}>
                                                {line.map((formation, idx) => (
                                                    <span key={idx}>{formation}{idx !== line.length - 1 ? ', ' : ''}</span>
                                                ))}
                                                <br/>
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div id='teamPage-playersSection'>
                        <h2>Players</h2>
                        <div id='teamPage-playersContainer'>
                            {/* Player components */}
                            {Object.values(playersList).map((player, index) => (
                                <Player
                                    key={index}
                                    name={Object.keys(playersList)[index]}
                                    playerData={player}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div id='teamPage-right'>
                    <div id='teamPage-upcomingMatches-section'>
                        <h3 className='teamPage-matchesHeader'>Upcoming Matches</h3>
                        <div id='teamPage-upcomingMatches'>
                            {upcomingMatchesList.map((match, index) => (
                                <SmallMatch
                                    key={index}
                                    matchID={Object.keys(upcomingMatchesList)[index]}
                                    matchData={match}
                                />
                            ))}
                        </div>
                    </div>
                    <div id='teamPage-previousMatches-section'>
                        <h3 className='teamPage-matchesHeader'>Previous Matches</h3>
                        <div id='teamPage-previousMatches'>
                            {previousMatchesList.map((match, index) => (
                                <SmallMatch
                                    key={index}
                                    matchID={Object.keys(previousMatchesList)[index]}
                                    matchData={match}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </Container>

        </div>
    );
  }


export default Team;