import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBarTOP from './components/NavBarTOP.js';
import LeagueStandings from './components/LeagueStandings.js';

// Bootstrap Components -------------------------------------------------------

// ----------------------------------------------------------------------------

function App() {
  return (
    <div className="App">
        <NavBarTOP/>
        <LeagueStandings/>
    </div>
  );
}

export default App;
