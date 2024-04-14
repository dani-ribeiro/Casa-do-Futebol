import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/previousMatchEvents.css';

function OngoingMatchEvents( {matchEvents} ) {
    return (
        <div id='previousMatchEvent-midBottom'>
            <div className='previousMatchEvent-timeline' id='previousMatchEvent-timeline-left'>
                {matchEvents.home && matchEvents.home.map((event, index) => (
                        <div className='previousMatchEvent-timelineEvent' key={index}>
                            <div className='previousMatchEvent-timelineIcon'>
                                {/* event icon */}
                                {event.type === 'Goal' && <img src='/images/goal.svg' alt='Goal' />}
                                {event.detail === 'Yellow Card' && <img src='/images/yellow-card.png' alt='Yellow Card' />}
                                {event.detail === 'Red Card' && <img src='/images/red-card.png' alt='Yellow Card'/>}
                                {event.detail === 'Penalty' && <p>(P)</p>}
                                {event.detail === 'Own Goal' && <p>(OG)</p>}
                            </div>
                            <p className='previousMatchEvent-timelineDescription'>{event.player} {event.time}'</p>
                        </div>
                    ))
                }
            </div>
            <div id='previousMatchEvent-border'>
                <img src='/images/goal.svg' className='spin' alt='Border'></img>
            </div>
            <div className='previousMatchEvent-timeline' id='previousMatchEvent-timeline-right'>
                {matchEvents.away && matchEvents.away.map((event, index) => (
                            <div className='previousMatchEvent-timelineEvent' key={index}>
                                <div className='previousMatchEvent-timelineIcon'>
                                    {/* event icon */}
                                    {event.type === 'Goal' && <img src='/images/goal.svg' alt='Goal' />}
                                    {event.detail === 'Yellow Card' && <img src='/images/yellow-card.png' alt='Yellow Card' />}
                                    {event.detail === 'Red Card' && <img src='/images/red-card.png' alt='Yellow Card'/>}
                                    {event.detail === 'Penalty' && <p>(P)</p>}
                                    {event.detail === 'Own Goal' && <p>(OG)</p>}
                                </div>
                                <p className='previousMatchEvent-timelineDescription'>{event.player} {event.time}'</p>
                            </div>
                        ))
                    }
            </div>
        </div>
    );
  }


export default OngoingMatchEvents;