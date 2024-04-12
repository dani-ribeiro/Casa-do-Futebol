import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/showBetModal.css';
// Bootstrap Components -------------------------------------------------------
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';



function ShowBetModal( { showBetModal, setShowBetModal, matchData, loggedIn, setLoggedIn} ){
    const [betWarning, setBetWarning] = useState('');
    // only allow betting if a valid wager is selected
    const [allowBetting, setAllowBetting] = useState(true);
    const [disableBet, setDisableBet] = useState(true);
    const [isChecked, setIsChecked] = useState( {
                                                    match_winner: null,
                                                    match_winner_odds: 0
                                                });

    // stores all betting odds for the match
    const [betOdds, setBetOdds] = useState({});
    // stores user entered wager amount (must be greater than or equal to 5 points)
    const [wagerAmount, setWagerAmount] = useState(0);
    // total payout if the bet is successful = wagerAmount * (product of all bet odds)       total payout >= 0
    const [totalPayout, setTotalPayout] = useState(0);

    // pre-match odds are only provided 1-14 days before the match
    // Chosen bookmaker: Bet365, ID: 8
    // Message from the API (https://www.api-football.com/documentation-v3#tag/Odds-(Pre-Match)/operation/get-odds)
    //  "We keep a 7-days history (The availability of odds may vary according to the leagues, seasons, fixtures and bookmakers)"
    useEffect(() => {

        const fetchOdds = async () => {
            try {
                const response = await fetch(`/api/matches/odds/${matchData.match_id}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch match odds");
                }
                const data = await response.json();
                if(data.success){
                    setBetOdds(data.odds);
                }else{
                    setBetWarning('No odds available')
                    setAllowBetting(false);
                }
            }catch (error){
                console.error('ERROR: Failed to fetch match odds', error);
            }
        };

        fetchOdds();
    }, [matchData]);

    // calculate total payout
    useEffect(() => {
        if(wagerAmount && isChecked.match_winner_odds !== null){
            const payout = parseFloat(wagerAmount) * isChecked.match_winner_odds;
            setTotalPayout(payout.toFixed(2));
        }
    }, [wagerAmount, isChecked.match_winner_odds]);

    // disables betting if invalid input
    useEffect(() => {
        if(wagerAmount >= 5 && !isNaN(totalPayout) && totalPayout >= 0 && wagerAmount <= loggedIn.points){
            if(isChecked.match_winner !== null){
                setDisableBet(false);
            }else{
                setDisableBet(true);
            }
        }else{
            setDisableBet(true);
        }
    }, [wagerAmount, totalPayout, loggedIn.points, isChecked.match_winner]);

    function handleCheckboxClick(bet_team, odds){
        setIsChecked((prevChecked) => {
            // untoggle checkbox
            if(prevChecked.match_winner === bet_team){
                return {
                    ...prevChecked,
                    match_winner: null,
                    match_winner_odds: 0
                };
            }else{  // toggle checkbox
                return {
                    ...prevChecked,
                    match_winner: bet_team,
                    match_winner_odds: odds
                };
            }
        });
    }

    function submitBet(submit){
        submit.preventDefault();    // prevent default form submission

        const betData = {
            match_id: matchData.match_id,
            bettor: loggedIn.username,
            wagerAmount,
            totalPayout,
            status: 'In Progress',
            match_date: matchData.date + ',' + matchData.time,
            bet_match_winner: isChecked.match_winner,
            odds_bet_match_winner: isChecked.match_winner_odds,
            user_points: loggedIn.points
        };
    
        fetch('/backend/placeBet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(betData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to place bet');
            }
            return response.json();
        })
        .then(data => {
            if(data.success){
                const updatedPoints = loggedIn.points - wagerAmount;
                setLoggedIn( {
                            ...loggedIn,
                            points: updatedPoints
                            })
                sessionStorage.setItem('points', updatedPoints);
                setShowBetModal({ show: false, data: null });
            }else{
                setBetWarning(data.error);
            }
        })
        .catch(error => {
            console.error('Failed to place bet', error);
        });
    }

    return (
        <Modal show={showBetModal} onHide={() => setShowBetModal( {show: false, data: null} )} animation={'fade'} centered size='lg'>
            <Modal.Header id='betModal'>
                {/* <!-- warning --> */}
                {betWarning && (
                    <div id="warning-edit" className='warning'>
                        <h3>{betWarning}</h3>
                    </div>
                )}
                <Modal.Title>PLACE A BET</Modal.Title>
                <Modal.Body>
                    <div id='betModal-top'>
                        <h5 className='betModal-top-teams'>{matchData.home_team} x {matchData.away_team}</h5>
                        <h5>{loggedIn.points.toLocaleString()} Points</h5>
                    </div>
                    {allowBetting && (
                    <form id='betForm'>
                        <Table id='betModal-odds' borderless size='sm'>
                            <tbody>
                                <tr className='betModal-oddsRow'>
                                    <td className='betModal-odds-stat align-middle'>Winning Odds</td>
                                    <td className='betModal-odds-odd align-middle'>
                                        <Button type='button' onClick={() => handleCheckboxClick(matchData.home_team, betOdds?.matchWinnerOdds?.home_win)} className={isChecked.match_winner === matchData.home_team? 'betModal-odd-checked' : 'betModal-odd-unchecked'}>
                                            <input
                                                type="checkbox"
                                                id="betModal-winOdds-home"
                                                value={matchData.home_team}
                                                checked={isChecked.match_winner === matchData.home_team}
                                                onChange={() => handleCheckboxClick(matchData.home_team, betOdds?.matchWinnerOdds?.home_win)}
                                                style={{ display: 'none' }}
                                            />
                                            {betOdds?.matchWinnerOdds?.home_win}x
                                        </Button>
                                        {matchData.home_team}
                                    </td>
                                    <td className='betModal-odds-odd align-middle'>
                                        <Button type='button' onClick={() => handleCheckboxClick('Draw', betOdds?.matchWinnerOdds?.draw)} className={isChecked.match_winner === 'Draw'? 'betModal-odd-checked' : 'betModal-odd-unchecked'}>
                                            <input
                                                type="checkbox"
                                                id="betModal-winOdds-draw"
                                                value='Draw'
                                                checked={isChecked.match_winner === 'Draw'}
                                                onChange={() => handleCheckboxClick('Draw',betOdds?.matchWinnerOdds?.draw)}
                                                style={{ display: 'none' }}
                                            />
                                            {betOdds?.matchWinnerOdds?.draw}x
                                        </Button>
                                        Draw
                                    </td>
                                    <td className='betModal-odds-odd align-middle'>
                                        <Button type='button' onClick={() => handleCheckboxClick(matchData.away_team, betOdds?.matchWinnerOdds?.away_win)} className={isChecked.match_winner === matchData.away_team? 'betModal-odd-checked' : 'betModal-odd-unchecked'}>
                                            <input
                                                type="checkbox"
                                                id="betModal-winOdds-away"
                                                value={matchData.away_team}
                                                checked={isChecked.match_winner === matchData.away_team}
                                                onChange={() => handleCheckboxClick(matchData.away_team, betOdds?.matchWinnerOdds?.away_win)}
                                                style={{ display: 'none' }}
                                            />
                                            {betOdds?.matchWinnerOdds?.away_win}x
                                        </Button>
                                        {matchData.away_team}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <InputGroup className="mt-3 mb-3 mx-auto">
                            <InputGroup.Text>Wager Amount</InputGroup.Text>
                            <Form.Control type={'number'}  min={5} max={loggedIn.points} onChange={(e) => setWagerAmount(Math.max(0, e.target.value))} required/>
                        </InputGroup>
                        <Button id='betForm-submit' type='submit' onClick={(submit) => submitBet(submit)} disabled={disableBet}>
                            Place Bet
                            <p>Total Payout: {totalPayout} points</p>
                        </Button>
                    </form>
                    )}
                </Modal.Body>
            </Modal.Header>
        </Modal>
    );
}

export default ShowBetModal;