import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/gameTop.css';
import LoadImage from "./LoadImage.js";

// Bootstrap Components -------------------------------------------------------
import Table from 'react-bootstrap/Table';
// ----------------------------------------------------------------------------

function MatchEvents( {matchData} ) {
    const [matchEvents, setMatchEvents] = useState({});

    useEffect(() => {
        const fetchMatchEvents = async () => {
            try {
                const response = await fetch(`/api/matches/previous/events/${matchData.match_id}/${matchData.home_id}/${matchData.away_id}`);
                if (!response.ok) {
                    throw new Error("ERROR: Failed to fetch match events");
                }
                const data = await response.json();
                console.log(data);
                setMatchEvents(data);
            }catch (error){
                console.error('ERROR: Failed to fetch match events', error);
            }
        };

        fetchMatchEvents();
    }, [matchData]);

    return (
        <div id='gameTop-midBottom'>
            <div className='gameTop-timeline' id='gameTop-timeline-left'>
                <div className='gameTop-timelineEvent'>
                    <div className='gameTop-timelineIcon'>
                        <img src='/images/yellow-card.png' alt='yellow card'></img>
                    </div>
                    <p className='gameTop-timelineDescription'>Ribeiro 5'</p>
                </div>
                <div className='gameTop-timelineEvent'>
                    <div className='gameTop-timelineIcon'>
                        <img src='/images/yellow-card.png' alt='yellow card'></img>
                    </div>
                    <p className='gameTop-timelineDescription'>Ribeiro 5'</p>
                </div>
                <div className='gameTop-timelineEvent'>
                    <div className='gameTop-timelineIcon'>
                        <img src='/images/yellow-card.png' alt='yellow card'></img>
                    </div>
                    <p className='gameTop-timelineDescription'>Ribeiro 5'</p>
                </div>
            </div>
            <div className='gameTop-timeline' id='gameTop-timeline-right'>
                <div className='gameTop-timelineEvent'>
                    <div className='gameTop-timelineIcon'>
                        <img src='/images/goal.svg' alt='penalty'></img>
                        <p>(P)</p>
                    </div>
                    <p className='gameTop-timelineDescription'>Fereira 30'</p>
                </div>
                <div className='gameTop-timelineEvent'>
                    <div className='gameTop-timelineIcon'>
                        <img src='/images/goal.svg' alt='penalty'></img>
                        <p>(P)</p>
                    </div>
                    <p className='gameTop-timelineDescription'>Fereira 30'</p>
                </div>
                <div className='gameTop-timelineEvent'>
                    <div className='gameTop-timelineIcon'>
                        <img src='/images/yellow-card.png' alt='yellow card'></img>
                    </div>
                    <p className='gameTop-timelineDescription'>Ribeiro 5'</p>
                </div>
            </div>
        </div>
    );
  }


export default MatchEvents;