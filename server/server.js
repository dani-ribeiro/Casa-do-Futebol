require('dotenv').config();

const mongoose = require('mongoose');
const Login = require('./models/login.model.js');

const express = require('express');
const app = express();
app.use(express.json());

const apicache = require('apicache');
const cache = apicache.middleware;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');

const PORT = 3456;

const options = {
    method: 'GET',
    headers: {
        'x-apisports-host': 'v3.football.api-sports.io',
        'x-apisports-key': process.env.API_KEY
    },
};

app.get('/api/standings/:leagueID/:seasonYEAR', cache('24 hours'), (req, res) => {
    const { leagueID, seasonYEAR } = req.params;
    fetch(`https://v3.football.api-sports.io/standings?league=${leagueID}&season=${seasonYEAR}`, options)
    .then(response => {
        if(!response.ok){
            throw new Error("ERROR: Bad Response");
        }else{
            return response.json();
        }
    })
    .then(data => {
        if(data.response && data.response.length > 0){
            // parse the response and send ONLY relevant data to client
            const league = data.response[0].league;
            if(league.standings){
                const standingsData = league.standings[0];
                const standings = {};    // dictionary mapping <Team, Team Information>

                /* team name (string): Team's Name  maps to     {   rank (int):              League position
                                                                    matches_played (int):    Total matches played
                                                                    wins (int):              Total matches won
                                                                    draws (int):             Total matches drawn
                                                                    losses (int):            Total matches lost
                                                                    goals_for (int):         Total goals against other teams
                                                                    goals_conceded (int):    Total goals scored against this team
                                                                    goal_difference (int):   Goal difference (goals_conceded - goals_for)
                                                                    points (int):            Total league points
                                                                    form (string):           Represents last 5 game record (i.e. WWLLD = win, win, lose, lose, draw)
                                                                }
                */

                for(const currentTeam of standingsData){
                    standings[currentTeam.team.name] =  {
                                                            team_id:            currentTeam.team.id,
                                                            rank:               currentTeam.rank,
                                                            matches_played:     currentTeam.all.played,
                                                            wins:               currentTeam.all.win,
                                                            draws:              currentTeam.all.played,
                                                            losses:             currentTeam.all.lose,
                                                            goals_for:          currentTeam.all.goals.for,
                                                            goals_conceded:     currentTeam.all.goals.against,
                                                            goals_difference:   currentTeam.goalsDiff,
                                                            points:             currentTeam.points,
                                                            form:               currentTeam.form,
                                                        }
                }
                res.json(standings);
            }else{
                // no standings available
                res.json({});
            }
        }else{
            // no response
            res.json({});
        }
    })
    .catch(error => console.error(error));
});

// account sign up process
app.post('/backend/signup', async (req, res) => {
    const { username, password } = req.body;

    const validInputPattern = /^[A-Za-z0-9]+$/;

    // empty username or password --> display error
    if(!username || !password){
        res.json({  success: false,
                    error: 'Empty'});
    }else if(username.length > 36 || !validInputPattern.test(username) || !validInputPattern.test(password)){
        // invalid input --> display error
        res.json({  success: false,
                    error: 'Invalid' });
    }else{  // valid input --> check if username is available --> salt + hash password --> store user credentials in DB
        try{
            // checks if username already exists
            const existingUser = await Login.findOne({ username });
            if(existingUser){
                res.json({ success: false, username, error: 'Username Exists' });
                return;
            }else{  // username is valid & doesn't exist --> create account!
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                Login.create({ username, password: hashedPassword });
                const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
                res.json({ success: true, token });
            }
        }catch(error){ 
            res.json({ success: false, error: 'ERROR: DB Connection Failed' });
        };
    }
  });

  // account login process
  app.post('/backend/login', async (req, res) => {
    const { username, password } = req.body;

    const validInputPattern = /^[A-Za-z0-9]+$/;

    // invalid or empty input --> display error
    if(!username || !password || username.length > 36 || !validInputPattern.test(username) || !validInputPattern.test(password)){
        res.json({  success: false,
                    error: 'Invalid'});
    }else{  // valid input --> verify password --> login
        try{
            // checks if username exists
            const existingUser = await Login.findOne({ username });
            if(!existingUser){  // user doesn't exist --> don't log in
                res.json({ success: false, error: 'Incorrect' });
                return;
            }else{  //user exists --> verify password
                bcrypt.compare(password, existingUser.password, function(err, match) {
                    if(match){
                        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
                        res.json({ success: true, token });
                    }else{
                        res.json( {success: false, error: 'Incorrect'} );
                    }
                });
            }
        }catch(error){ 
            res.json({ success: false, error: 'ERROR: DB Connection Failed' });
        };
    }
  });

    // edit username process
    app.put('/backend/editUsername', async (req, res) => {
        const { currentUsername, username } = req.body;

        const validInputPattern = /^[A-Za-z0-9]+$/;

        // empty username --> display error
        if(!username || username.length > 36 || !validInputPattern.test(username)){
            // invalid input --> display error
            res.json({  success: false,
                        error: 'Invalid' });
        }else{  // valid input --> check if username is available --> store user credentials in DB
            try{
                // checks if username already exists
                const existingUser = await Login.findOne({ username });
                if(existingUser){
                    res.json({ success: false, username, error: 'Username Exists' });
                    return;
                }else{  // username is valid & doesn't exist --> change username!
                    const updatedUser = await Login.findOneAndUpdate(
                        { username: currentUsername },
                        { username },
                        { new: true }
                    );
                    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.json({ success: true, username, token });
                }
            }catch(error){ 
                res.json({ success: false, error: 'ERROR: DB Connection Failed' });
            };
        }
    });

    // fetches team information
    app.get('/api/team/:leagueID/:seasonYEAR/:teamID', cache('24 hours'), (req, res) => {
        const { leagueID, seasonYEAR, teamID } = req.params;
        fetch(`https://v3.football.api-sports.io/teams/statistics?league=${leagueID}&season=${seasonYEAR}&team=${teamID}`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            if(data.response){
                // parse the response and send ONLY relevant data to client
                const team = data.response;
                if(team){
                    const teamLogo =    team.team.logo;
                    const teamName =    team.team.name;
                    const league =      team.league.name;

                    const matchesPlayed = team.fixtures.played.total || 0;
                    const wins = team.fixtures.wins.total || 0;
                    const draws = team.fixtures.draws.total || 0;
                    const loses = team.fixtures.loses.total || 0;
                    const goalsFor = parseFloat(team.goals.for.total.total) || 0;
                    const goalsAgainst = parseFloat(team.goals.against.total.total) || 0;
                    const goalDiff = goalsFor - goalsAgainst;

                    // compute average goals per game
                    const avgForGoals = parseFloat(team.goals.for.average.total) || 0;
                    const avgAgainstGoals = parseFloat(team.goals.against.average.total) || 0;
                    const averageGoals = ((avgForGoals + avgAgainstGoals) / 2).toFixed(1);

                    // assign best win/best loss regardless of whether the game was home/away --> initialize with home best game
                    let bestWin = team.biggest.wins.home || '';
                    let worstLoss = team.biggest.loses.home || '';
                    // set biggest win
                    if(team.biggest.wins.away) {
                        const awayWinGoals = team.biggest.wins.away.split('-').reduce((total, num) => total + parseInt(num), 0);
                        const currentBestWinGoals = bestWin.split('-').reduce((total, num) => total + parseInt(num), 0);
                        if(awayWinGoals > currentBestWinGoals){
                            bestWin = team.biggest.wins.away;
                        }
                    }
                    // set biggest loss
                    if (team.biggest.loses.away) {
                        const awayLossGoals = team.biggest.loses.away.split('-').reduce((total, num) => total + parseInt(num), 0);
                        const currentBestLossGoals = worstLoss.split('-').reduce((total, num) => total + parseInt(num), 0);
                        if (awayLossGoals > currentBestLossGoals) {
                            worstLoss = team.biggest.loses.away;
                        }
                    }

                    const cleanSheets = team.clean_sheet.total || 0;
                    const failedScore = team.failed_to_score.total || 0;

                    // calculate the number of total cards
                    let yellowCards = 0;
                    let redCards = 0;

                    // iterates through every minute of the game and tallies # of yellow cards
                    Object.values(team.cards.yellow).forEach((range) => {
                        if(range.total !== null){
                            yellowCards += range.total;
                        }
                    });
                    // iterates through every minute of the game and tallies # of red cards
                    Object.values(team.cards.red).forEach((range) => {
                        if(range.total !== null){
                            redCards += range.total;
                        }
                    });

                    const longestWinStreak = team.biggest.streak.wins || 0;

                    // parses lineups and constructs a lineup string (i.e. "4-3-3 (24), 4-3-2-1 (2)" where formation comes first, followed by number of matches played in the formation)
                    let formations = '';

                    team.lineups.forEach((lineup, index) => {
                        if(index > 0){
                            formations += ', ';
                        }
                        formations += `${lineup.formation} (${lineup.played})`;
                    });


                    // send data to client!
                    const teamInfo = {
                        teamLogo,
                        teamName,
                        league,
                        matchesPlayed,
                        wins,
                        draws,
                        loses,
                        goalsFor,
                        goalsAgainst,
                        goalDiff,
                        averageGoals,
                        bestWin,
                        worstLoss,
                        cleanSheets,
                        failedScore,
                        yellowCards,
                        redCards,
                        longestWinStreak,
                        formations
                    };

                    res.json(teamInfo);
                }
            }else{
                // data not available
                res.json({});
            }
        })
        .catch(error => console.error(error));
    });

    // fetches basic player information
    app.get('/api/players/:leagueID/:seasonYEAR/:teamID', cache('24 hours'), (req, res) => {
        const { leagueID, seasonYEAR, teamID } = req.params;
        fetch(`https://v3.football.api-sports.io/players/squads?team=${teamID}`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            // parse the response and send ONLY relevant data to client
            const team = data.response[0];
            if(team.players){
                const playersData = team.players;
                const players = {};    // dictionary mapping <Player, Player Information>

                /* Player Name (string): Player Name  maps to     { player_id (int):         Player's API ID       
                                                                    age (int)                Player's age
                                                                    number (int)             Player's jersey number
                                                                    position (string)        Player's position
                                                                    photo (URL)              URL to player's image
                                                                }
                */

                for(const currentPlayer of playersData){
                    players[currentPlayer.name] =  {
                                                    player_id: currentPlayer.id,
                                                    age:        currentPlayer.age,
                                                    number:     currentPlayer.number,
                                                    position:   currentPlayer.position,
                                                    photo:      currentPlayer.photo
                                                }
                }

                res.json(players);
            }else{
                // data not available
                res.json({});
            }
        })
        .catch(error => console.error(error));
    });

    // fetches team matches and separates them into previous and upcoming matches
    app.get('/api/fixtures/:season/:teamID', cache('24 hours'), (req, res) => {
        const { season, teamID } = req.params;
        fetch(`https://v3.football.api-sports.io/fixtures?season=${season}&team=${teamID}`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            // parse the response and send ONLY relevant data to client
            const matches = data.response;
            if(matches.length > 0){
                const previous = {};
                const upcoming = {};

                /* match_id (int): Match ID maps to     {   home_team (string)       Home Team
                                                            home_id (int)            Home Team's API ID
                                                            home_logo (URL)          Home Team's Logo

                                                            away_team (string)       Away Team
                                                            away_id (int)            Away Team's API ID
                                                            away_logo (URL)          Away Team's Logo

                                                            date (string)            Date of the match
                                                            time (string)            Time of the match
                                                            
                                                            status (string)          Game finished or ongoing

                                                            home_score (int)         Home Team's Goals (match finished)     
                                                            away_score (int)         Away Team's Goals (match finished)
                                                        }
                */

                for(const match of matches){
                    // re-format date and time of the match
                    const matchDate = new Date(match.fixture.date);
                    const date = matchDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    const time = matchDate.toLocaleTimeString('en-US', {
                        hour: 'numeric', 
                        minute: '2-digit' 
                    });

                    // FT = Full Time (match is over) --> Add it to previous matches
                    if(match.fixture.status.short === 'FT'){

                        previous[match.fixture.id] = {
                                                        home_team:      match.teams.home.name,
                                                        home_id:        match.teams.home.id,
                                                        home_logo:      match.teams.home.logo,
                                                        away_team:      match.teams.away.name,
                                                        away_id:        match.teams.away.id,
                                                        away_logo:      match.teams.away.logo,
                                                        date:           date,
                                                        time:           time,
                                                        status:         match.fixture.status.short,
                                                        home_score:     match.score.fulltime.home,
                                                        away_score:     match.score.fulltime.away,
                                                    }
                        
                    }else{  // otherwise the game either hasn't occured or is ongoing --> Add it to upcoming matches (without scores)
                        upcoming[match.fixture.id] = {
                                                        home_team:      match.teams.home.name,
                                                        home_id:        match.teams.home.id,
                                                        home_logo:      match.teams.home.logo,
                                                        away_team:      match.teams.away.name,
                                                        away_id:        match.teams.away.id,
                                                        away_logo:      match.teams.away.logo,
                                                        date:           date,
                                                        time:           time,
                                                        status:         match.fixture.status.short,
                                                    }
                    }
                }

                res.json( { upcoming, previous } );
            }else{
                // data not available
                res.json({});
            }
        })
        .catch(error => console.error(error));
    });


mongoose.connect(`${process.env.DB_CONNECTION}`)
.then(() => {
    console.log('Connected to the database');
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
});