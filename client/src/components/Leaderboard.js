import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/leaderboard.css';
// Bootstrap Components -------------------------------------------------------
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function Leaderboard( {setCurrentView, loggedIn} ) {
    const [points, setPoints] = useState(loggedIn.points);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userBets, setUserBets] = useState([]);

    // fetches top 5 users on the points leaderboard
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/backend/leaderboard');
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch leaderboard");
                }
                const data = await response.json();
                setLeaderboard(data);
            }catch (error){
                console.error('ERROR: Failed to fetch leaderboard', error);
            }
        };
        fetchLeaderboard();
    }, []);

    // fetches logged in user's betting history
    useEffect(() => {
        const fetchBets = async () => {
            try {
                const response = await fetch(`/backend/bets/${loggedIn.userID}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch bets");
                }
                const data = await response.json();
                setUserBets(data);
            }catch (error){
                console.error('ERROR: Failed to fetch bets', error);
            }
        };

        if(loggedIn.status){
            fetchBets();
        }
    }, [loggedIn.userID, loggedIn.status]);

    useEffect(() => {
        setPoints(loggedIn.points);
    }, [loggedIn.points, points]);

    return (
        <div id='leaderboard-page'>
            <Container fluid id='leaderboard-container'>
                <h2>Leaderboard</h2>
                <hr/>
                <Table id='leaderboard' responsive className='table-container'>
                    <thead className='table-head'>
                        <tr>
                            <td id='leaderboard-position-head' className='table-head-td'>Rank</td>
                            <td id='leaderboard-name-head' className='table-head-td table-middle'>Username</td>
                            <td id='leaderboard-points-head' className='table-head-td'>Points</td>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user, index) => (
                            <tr key={user._id}>
                                <td className='leaderboard-left'>{index + 1}</td>
                                <td className=' leaderboard-middle'>{user.username}</td>
                                <td className='leaderboard-right'>{user.points}</td>
                            </tr>
                        ))}
                    </tbody>

                </Table>
            </Container>
            {loggedIn.status && sessionStorage.getItem('userID') !== undefined && (
                <Container fluid id='points-container'>
                    <div className='points-top'>
                        <h3>Points</h3>
                        <hr/>
                        <img src='/images/points.png' alt='Points'></img>
                        <h2>{loggedIn.points}</h2>
                    </div>
                    <div className='points-bottom'>
                        <h3>History</h3>
                        <hr/>
                        <Table id='previousBets' responsive className='table-container'>
                            <thead className='table-head'>
                                <tr>
                                    <td className='table-head-td'>Points</td>
                                    <td className='table-head-td'>Status</td>
                                    <td className='table-head-td'>Chosen Winner</td>
                                    <td className='table-head-td'>Match</td>
                                    <td className='table-head-td'>Match Date</td>
                                </tr>
                            </thead>
                            <tbody>
                                {userBets.map((bet, index) => (
                                    <tr key={index}>
                                        <td>{bet.actual_payout}</td>
                                        <td>{bet.status}</td>
                                        <td>{bet.bet_match_winner}</td>
                                        <td>{bet.match_description}</td>
                                        <td>{bet.match_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                    </div>
                </Container>
            )}

        </div>
    );
  }

export default Leaderboard;