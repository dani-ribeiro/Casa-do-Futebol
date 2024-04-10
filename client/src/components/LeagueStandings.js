import { useState, useEffect, useMemo } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/LeagueStandings.css';
// Bootstrap Components -------------------------------------------------------
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function LeagueStandings({setCurrentView}) {
    const currentYear = new Date().getFullYear();

    const [currentSeason, setCurrentSeason] = useState(currentYear); // default
    const [activeTab, setActiveTab] = useState('Brasileirão');
    const [standings, setStandings] = useState({});

    // maps <League Name, { League ID, Season Offset }>             season offset: accounts for leagues starting earlier/later than others 
    const leagues = useMemo(() => ({
        'Brasileirão': { id: 71, offset: 0 },
        'Bundesliga': { id: 78, offset: -1 },
        'EPL': { id: 39, offset: -1 },
        'La Liga': { id: 140, offset: -1 },
        'Ligue 1': { id: 61, offset: -1 },
        'Serie A': { id: 135, offset: -1 }
    }), []);
    
    useEffect(() => {
        fetchStandings(leagues[activeTab].id, currentSeason);
    }, [currentSeason, activeTab, leagues]);

    function handleTabClick(leagueName) {
        setActiveTab(leagueName);
        setCurrentSeason(currentYear + leagues[leagueName].offset);
        fetchStandings(leagues[leagueName].id, currentSeason);
    }

    function handleTeamClick(teamID){
        setCurrentView({ page: 'Team', data: {
                                                leagueID: leagues[activeTab].id,
                                                teamID: teamID,
                                                season: currentSeason,
                                            } });
    }

    function fetchStandings(leagueID, seasonYEAR){
        fetch(`/api/standings/${leagueID}/${seasonYEAR}`)
            .then(response => {
                if (!response.ok) {
                }
                return response.json();
            })
            .then(data => setStandings(data))
            .catch(error => console.error('Error fetching standings:', error));
    }


    return (
        <div className="leagueStandingsPage">
            <Container fluid id='leagueStandings-background'>
                <div id='leagueStandings'>
                    <h3 id='standingText'>Standings</h3>
                    <div id='leagueHolder' className='flex justify-center'>
                        {/* handles selecting a league table */}
                        {Object.keys(leagues).map((leagueName, index) => (
                            <button
                                key={index}
                                id={leagueName}
                                className={`rounded-top league ${activeTab === leagueName ? 'activeLeague' : ''}`}
                                onClick={() => handleTabClick(leagueName)}
                            >
                                {leagueName}
                            </button>
                        ))}
                    </div>
                    <div className="table-container">
                        <Table striped responsive hover id='leagueTable'>
                            <thead className="table-head">
                                <tr>
                                    <th className='table-position'></th>
                                    <th className='table-team'></th>
                                    <th className='table-stat'>MP</th>
                                    <th className='table-stat'>W</th>
                                    <th className='table-stat'>D</th>
                                    <th className='table-stat'>L</th>
                                    <th className='table-stat'>GF</th>
                                    <th className='table-stat'>GA</th>
                                    <th className='table-stat'>GD</th>
                                    <th className='table-stat'>P</th>
                                    <th className='table-form'>Form</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* sorts teams by league ranking and displays their information in the table */}
                                {
                                    Object.keys(standings)
                                    .sort((team1, team2) => standings[team1].rank - standings[team2].rank)
                                    .map((teamName, index) => (
                                    <tr key={index} onClick={() => handleTeamClick(standings[teamName].team_id)}>
                                        <td className='table-position'>{standings[teamName].rank}</td>
                                        <td className='table-team'>{teamName}</td>
                                        <td className='table-stat'>{standings[teamName].matches_played}</td>
                                        <td className='table-stat'>{standings[teamName].wins}</td>
                                        <td className='table-stat'>{standings[teamName].draws}</td>
                                        <td className='table-stat'>{standings[teamName].losses}</td>
                                        <td className='table-stat'>{standings[teamName].goals_for}</td>
                                        <td className='table-stat'>{standings[teamName].goals_conceded}</td>
                                        <td className='table-stat'>{standings[teamName].goals_difference}</td>
                                        <td className='table-stat'>{standings[teamName].points}</td>
                                        <td className='table-form'>
                                            {   standings[teamName].form && 
                                                standings[teamName].form.split('').map((char, i) => (
                                                <span
                                                    key={char + i}
                                                    className={`formLetter ${char === 'L' ? 'lose' : char === 'D' ? 'draw' : 'win'}`}
                                                >
                                                O
                                                </span>
                                            ))}
                                        </td>


                                        {/* <td className='table-form'>{standings[teamName].form}</td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </Container>







        </div>
    );
  }


export default LeagueStandings;