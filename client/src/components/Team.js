import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/team.css';
import SmallMatch from './SmallMatch.js';
import Player from './Player.js';
import LoadImage from './LoadImage.js';
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
    const [ongoingMatchesList, setOngoingMatches] = useState([]);

    // fetches team information
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(`/api/team/${leagueID}/${season}/${teamID}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch team information");
                }
                const data = await response.json();

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
            
                // re-establishes logo URL (prevents CORB)
                const imageURL = await fetchLogo(teamID);
                data.teamLogo = imageURL;

                setTeamContent(data);
            }catch (error){
                console.error('ERROR: Failed to fetch team information', error);
            }
        };

        fetchTeam();
    }, [leagueID, season, teamID]);

    // fetches players
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch(`/api/players/${leagueID}/${season}/${teamID}`);
                if (!response.ok) {
                    throw new Error('ERROR: Failed to fetch players');
                }
                const data = await response.json();
                 // re-establishes player picture URL (prevents CORB)
                const updatedPlayersList = await Promise.all(
                    Object.values(data).map(async (player) => {
                        const playerID = player.player_id;
                        const playerPhotoURL = await fetchPlayerPicture(playerID);
                        player.photo = playerPhotoURL;
                        return player;
                    })
                );
                setPlayersList(updatedPlayersList);
            }catch (error){
                console.error("ERROR: Failed to fetch players", error);
            }
        };

        fetchPlayers();
    }, [leagueID, season, teamID]);

    // fetches all matches for the team
    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const response = await fetch(`/api/fixtures/${season}/${teamID}`);
                if (!response.ok) {
                    throw new Error('ERROR: Failed to fetch fixtures');
                }
                const data = await response.json();

                // re-establishes logo URL for each logo (prevents CORB)
                const updatedUpcomingMatches = await Promise.all(
                    Object.values(data.upcoming).map(async (match, index) => {
                        const away_id = match.away_id;
                        const away_logo = await fetchLogo(away_id);
                        const home_id = match.home_id;
                        const home_logo = await fetchLogo(home_id);

                        match.away_logo = away_logo;
                        match.home_logo = home_logo;
                        match.match_id = Object.keys(data.upcoming)[index];
                        return match;
                    })
                );

                const updatedPreviousMatches = await Promise.all(
                    Object.values(data.previous).map(async (match, index) => {
                        const away_id = match.away_id;
                        const away_logo = await fetchLogo(away_id);
                        const home_id = match.home_id;
                        const home_logo = await fetchLogo(home_id);
                        
                        match.away_logo = away_logo;
                        match.home_logo = home_logo;
                        match.match_id = Object.keys(data.previous)[index];
                        return match;
                    })
                );

                const updatedOngoingMatches = await Promise.all(
                    Object.values(data.ongoing).map(async (match, index) => {
                        const away_id = match.away_id;
                        const away_logo = await fetchLogo(away_id);
                        const home_id = match.home_id;
                        const home_logo = await fetchLogo(home_id);

                        match.away_logo = away_logo;
                        match.home_logo = home_logo;
                        match.match_id = Object.keys(data.ongoing)[index];
                        return match;
                    })
                );

                // sorts upcoming matches in chronoloigcal order
                updatedUpcomingMatches.sort((a, b) => {
                    return new Date(a.date) - new Date(b.date);
                });

                // sorts previous matches in reverse-chronoloigcal order
                updatedPreviousMatches.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });

                setUpcomingMatches(updatedUpcomingMatches);
                setPreviousMatches(updatedPreviousMatches);
                setOngoingMatches(updatedOngoingMatches);
            }catch (error){
                console.error("ERROR: Failed to fetch fixtures", error);
            }
        };

        fetchFixtures();
    }, [leagueID, season, teamID]);

    // re-establish team logo URL (prevents CORB)
    async function fetchLogo(teamID){
        try {
            const response = await fetch(`/api/team-logo/${teamID}`);
            if (!response.ok) {
                console.error('ERROR: Unable to fetch team logo')
            }

            const imageData = await response.blob();
            const imageURL = URL.createObjectURL(imageData);
            return imageURL;
        } catch (error) {
            console.error("ERROR: Unable to fetch team logo", error);
        }
    };

    // re-establish player picture URL (prevents CORB)
    async function fetchPlayerPicture(playerID){
        try {
            const response = await fetch(`/api/player-picture/${playerID}`);
            if (!response.ok) {
                console.error('ERROR: Unable to fetch player picture')
            }

            const imageData = await response.blob();
            const imageURL = URL.createObjectURL(imageData);
            return imageURL;
        } catch (error) {
            console.error("ERROR: Unable to fetch player picture", error);
        }
    };

    return (
        <div id='teamPage'>
            <Container fluid id='team-background'>
                <div id='teamPage-left'>
                    <div id='teamPage-basicHolder'>
                        <LoadImage className={'teamPage-teamLogo'} src={teamContent.teamLogo} alt={'Team Crest'}/>
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
                        {/* API doesn't provide team squads for non-current seasons --> don't display players */}
                        {season >= 2023 &&
                        <>
                            <h2>Players</h2>
                            <div id='teamPage-playersContainer'>
                                {/* Player components */}
                                {Object.values(playersList).map((player, index) => (
                                    <Player
                                        key={index}
                                        name={player.name}
                                        playerData={player}
                                        season={season}
                                        teamLogo={teamContent.teamLogo}
                                    />
                                ))}
                            </div>
                        </>
                        }
                    </div>
                </div>
                <div id='teamPage-right'>
                    {season >= 2023 &&
                        <div id='teamPage-ongoingMatches-section'>
                            <h3 className='teamPage-matchesHeader'>Ongoing Matches</h3>
                            <div className='teamPage-matches'>
                                {ongoingMatchesList.map((match, index) => (
                                    <SmallMatch
                                        key={index}
                                        matchData={match}
                                        setCurrentView={setCurrentView}
                                        gameType={'ongoing'}
                                    />
                                ))}
                            </div>
                        </div>
                    }
                    {season >= 2023 &&
                        <div id='teamPage-upcomingMatches-section'>
                            <h3 className='teamPage-matchesHeader'>Upcoming Matches</h3>
                            <div className='teamPage-matches'>
                                {upcomingMatchesList.map((match, index) => (
                                    <SmallMatch
                                        key={index}
                                        matchData={match}
                                        setCurrentView={setCurrentView}
                                        gameType={'upcoming'}
                                    />
                                ))}
                            </div>
                        </div>
                    }
                    <div id='teamPage-previousMatches-section'>
                        <h3 className='teamPage-matchesHeader'>Previous Matches</h3>
                        <div className='teamPage-matches'>
                            {previousMatchesList.map((match, index) => (
                                <SmallMatch
                                    key={index}
                                    matchData={match}
                                    setCurrentView={setCurrentView}
                                    gameType={'previous'}
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