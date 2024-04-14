import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/player.css';
import LoadImage from './LoadImage.js';

function Player( {setCurrentView, name, playerData, season, teamLogo} ) {
    const playerName = name;
    const photo = playerData.photo;

    // displays specific player's page when user clicks on a player
    function handlePlayerClick(playerData){
        setCurrentView( { page: 'Player', data: {playerData, season, teamLogo} });
    }

    return (
        <div className='teamPage-playerBox' onClick={() => handlePlayerClick(playerData)}>
            <LoadImage src={photo} alt={name} className={'teamPage-playerImg'} id={''}/>
            <p className='teamPage-playerName'>{playerName}</p>
        </div>
    );
  }


export default Player;