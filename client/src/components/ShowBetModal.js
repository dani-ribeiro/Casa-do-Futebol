import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/showBetModal.css';
// Bootstrap Components -------------------------------------------------------
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';



function ShowBetModal( { showBetModal, setShowBetModal, matchData, loggedIn} ){
    const [betWarning, setBetWarning] = useState('');
    const [allowBetting, setAllowBetting] = useState(true);
    const [isChecked, setIsChecked] = useState( {
                                                    match_winner: null,
                                                    match_winner_odds: 0
                                                });

    const [betOdds, setBetOdds] = useState({});
    const [wagerAmount, setWagerAmount] = useState(0);
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
                console.log(data);
                if(data.success){
                    setBetOdds(data);
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
        if (wagerAmount && isChecked.match_winner_odds !== null) {
            const payout = parseFloat(wagerAmount) * isChecked.match_winner_odds;
            setTotalPayout(payout.toFixed(2));
        }
    }, [wagerAmount, isChecked.match_winner_odds]);

    useEffect(() => {
        console.log(isChecked);
    }, [isChecked]);

    function handleCheckboxClick(bet_team, odds) {
        setIsChecked((prevChecked) => ({
            ...prevChecked,
            match_winner: bet_team,
            match_winner_odds: odds
        }));
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
                        <h5>300 Points</h5>
                    </div>
                    {allowBetting && (
                    <form id='betForm'>
                        <Table id='betModal-odds' borderless size='sm'>
                            <tbody>
                                <tr className='betModal-oddsRow'>
                                    <td className='betModal-odds-stat align-middle'>Winning Odds</td>
                                    <td className='betModal-odds-odd align-middle'>
                                        <Button type='button' onClick={() => handleCheckboxClick(matchData.home_team, betOdds?.odds?.matchWinnerOdds?.home_win)} className={isChecked.match_winner === matchData.home_team? 'betModal-odd-checked' : 'betModal-odd-unchecked'}>
                                            <input
                                                type="checkbox"
                                                id="betModal-winOdds-home"
                                                value={matchData.home_team}
                                                checked={isChecked.match_winner === matchData.home_team}
                                                onChange={() => handleCheckboxClick(matchData.home_team, betOdds?.odds?.matchWinnerOdds?.home_win)}
                                                style={{ display: 'none' }}
                                            />
                                            {betOdds?.odds?.matchWinnerOdds?.home_win}x
                                        </Button>
                                        {matchData.home_team}
                                    </td>
                                    <td className='betModal-odds-odd align-middle'>
                                        <Button type='button' onClick={() => handleCheckboxClick('Draw', betOdds?.odds?.matchWinnerOdds?.draw)} className={isChecked.match_winner === 'Draw'? 'betModal-odd-checked' : 'betModal-odd-unchecked'}>
                                            <input
                                                type="checkbox"
                                                id="betModal-winOdds-draw"
                                                value='Draw'
                                                checked={isChecked.match_winner === 'Draw'}
                                                onChange={() => handleCheckboxClick('Draw',betOdds?.odds?.matchWinnerOdds?.draw)}
                                                style={{ display: 'none' }}
                                            />
                                            {betOdds?.odds?.matchWinnerOdds?.draw}x
                                        </Button>
                                        Draw
                                    </td>
                                    <td className='betModal-odds-odd align-middle'>
                                        <Button type='button' onClick={() => handleCheckboxClick(matchData.away_team, betOdds?.odds?.matchWinnerOdds?.away_win)} className={isChecked.match_winner === matchData.away_team? 'betModal-odd-checked' : 'betModal-odd-unchecked'}>
                                            <input
                                                type="checkbox"
                                                id="betModal-winOdds-away"
                                                value={matchData.away_team}
                                                checked={isChecked.match_winner === matchData.away_team}
                                                onChange={() => handleCheckboxClick(matchData.away_team, betOdds?.odds?.matchWinnerOdds?.away_win)}
                                                style={{ display: 'none' }}
                                            />
                                            {betOdds?.odds?.matchWinnerOdds?.away_win}x
                                        </Button>
                                        {matchData.away_team}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <InputGroup className="mt-3 mb-3 mx-auto">
                            <InputGroup.Text>Wager Amount</InputGroup.Text>
                            <Form.Control type={'number'}  min={5} onChange={(e) => setWagerAmount(Math.max(5, e.target.value))} required/>
                        </InputGroup>
                        <Button id='betForm-submit' type='submit' onClick={() => console.log('submitted')} disabled={isNaN(totalPayout) || totalPayout < 5}>
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