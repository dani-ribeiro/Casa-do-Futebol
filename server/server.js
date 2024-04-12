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

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

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

                    // assign best win/best loss regardless of whether the game was home/away
                    let bestWin = '0-0' || '';
                    let worstLoss = '0-0' || '';
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
                                                    player_id:  currentPlayer.id,
                                                    name:       currentPlayer.name,
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

    // fetches advanced player information
    app.get('/api/player/:playerID/:seasonYEAR', cache('24 hours'), (req, res) => {
        const { playerID, seasonYEAR } = req.params;

        fetch(`https://v3.football.api-sports.io/players?id=${playerID}&season=${seasonYEAR}`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            // parse the response and send ONLY relevant data to client
            const player_data = data.response[0];
            if(player_data){
                const player = player_data.player;
                const statistics = player_data.statistics;
                if(player && statistics){
                    const playerInfo = {};      // dictionary mapping <Player, Player Information>

                    /* Player ID (int): maps to     {   nationality
                                                        firstName,
                                                        lastName,
                                                        height          Player's height (cm),
                                                        weight          Player's weight (kg),
                                                        captain         Whether player is captain or not

                                                        The below statistics are summed across all leagues/tournaments, and divided by position
                                                        all_positions   {
                                                                            appearances    Total # of appearances,
                                                                            minutes        Total # of minutes played,
                                                                            rating         Average performance of player (1-10),
                                                                            totalPasses,
                                                                            keyPasses,
                                                                            passAccuracy,
                                                                            foulsDrawn      Total # of fouls drawn by other players,
                                                                            foulsCommitted  Total # of fouls committed to other players,
                                                                            yellowCards     Total # of yellow cards,
                                                                            redCards        Total # of red cards (including yellow --> red),
                                                                            duelsWon        Fraction representing (number of duels won)/total duels
                                                                        },
                                                                        
                                                        goalkeeper      {
                                                                            conceded,
                                                                            saved,
                                                                            penalty_committed      Total # of penalties given away,
                                                                            penalty_saved          Total # of penalties saved
                                                                        },

                                                        defender        {
                                                                            goals,
                                                                            conceded,
                                                                            assists,
                                                                            tackles,
                                                                            penalty_committed      Total # of penalties given away,
                                                                            penalties_converted       Fraction representing (number of penalties scored)/total penalties taken        
                                                                        },

                                                        midfielder      {
                                                                            goals,
                                                                            conceded,
                                                                            assists,
                                                                            shots                       Fraction representing (total shots on target)/total shots,
                                                                            dribbles                    Fraction representing (total successful dribbles)/total dribbles attempted,
                                                                            penalty_committed           Total # of penalties given away,
                                                                            penalty_drawn               Total # of penalties awarded
                                                                            penalties_converted         Fraction representing (number of penalties scored)/total penalties taken  
                                                                        },

                                                        attacker        {
                                                                            goals,
                                                                            assists,
                                                                            shots                       Fraction representing (total shots on target)/total shots,
                                                                            dribbles                    Fraction representing (total successful dribbles)/total dribbles attempted,
                                                                            penalty_drawn               Total # of penalties awarded,
                                                                            penalties_converted         Fraction representing (number of penalties scored)/total penalties taken  
                                                                        }
                                                    }
            //     */
                    playerInfo.nationality = player.nationality;
                    playerInfo.firstName = player.firstname;
                    playerInfo.lastName = player.lastname;
                    playerInfo.height = player.height;
                    playerInfo.weight = player.weight;
                    playerInfo.captain = statistics[0].games.captain;
                    playerInfo.team = statistics[0].team.name;
                    playerInfo.position = statistics[0].games.position;
                    playerInfo.birthday = new Date(player.birth.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });

                    let all_positions = {
                                            appearances:    0,
                                            minutes:        0,
                                            rating:         0,         
                                            totalPasses:    0,
                                            keyPasses:      0,
                                            passAccuracy:   0,
                                            foulsDrawn:     0,
                                            foulsCommitted: 0,
                                            yellowCards:    0,     
                                            redCards:       0,
                                            duelsWon:       0,
                                            totalDuels:     0        
                                        }
                    let goalkeeper = {
                                        conceded:           0,
                                        saved:              0,
                                        penalty_comitted:   0,         
                                        penalty_saved:      0,     
                                    }

                    let defender = {
                                        goals:                  0,
                                        conceded:               0,
                                        assists:                0,         
                                        tackles:                0, 
                                        penalty_committed:      0,
                                        penalties_converted:    0,
                                        penalties_total:         0    
                                    }

                    let midfielder = {
                                        goals:                  0,
                                        conceded:               0,
                                        assists:                0,
                                        shots:                  0,
                                        total_shots:            0,
                                        dribbles:               0,
                                        total_dribbles:         0,
                                        penalty_committed:      0,
                                        penalty_drawn:          0,
                                        penalties_converted:    0,
                                        penalties_total:         0    
                    }

                    let attacker = {
                                    goals:                  0,
                                    assists:                0,
                                    shots:                  0,
                                    total_shots:            0,
                                    dribbles:               0,
                                    total_dribbles:         0,
                                    penalty_drawn:          0,
                                    penalties_converted:    0,
                                    penalties_total:         0    
                                }


                    let leagueCount = 0;
                    statistics.forEach(leagueStats => {
                        if(leagueStats.games.rating !== null){
                            leagueCount += 1;
                        }
                        // all_positions statistics
                        all_positions.appearances += leagueStats.games.appearences || 0;
                        all_positions.minutes += leagueStats.games.minutes || 0;
                        all_positions.rating += parseFloat(leagueStats.games.rating) || 0;            // averaged
                        all_positions.totalPasses += leagueStats.passes.total || 0;
                        all_positions.keyPasses += leagueStats.passes.key || 0;
                        all_positions.passAccuracy += leagueStats.passes.accuracy || 0;   // averaged
                        all_positions.foulsDrawn += leagueStats.fouls.drawn || 0;
                        all_positions.foulsCommitted += leagueStats.fouls.committed || 0;
                        all_positions.yellowCards += leagueStats.cards.yellow || 0;
                        all_positions.redCards += (leagueStats.cards.red || 0) + (leagueStats.cards.yellowred || 0);
                        all_positions.duelsWon += leagueStats.duels.won || 0;
                        all_positions.totalDuels += leagueStats.duels.total || 0;

                        // goalkeeper statistics
                        goalkeeper.conceded += leagueStats.goals.conceded || 0;
                        goalkeeper.saved += leagueStats.goals.saves || 0;
                        goalkeeper.penalty_comitted += leagueStats.penalty.committed || 0;
                        goalkeeper.penalty_saved += leagueStats.penalty.saved || 0;

                        // defender statistics
                        defender.goals += leagueStats.goals.total || 0;
                        defender.conceded += leagueStats.goals.conceded || 0;
                        defender.assists += leagueStats.goals.assists || 0;
                        defender.tackles += leagueStats.tackles.total || 0;
                        defender.penalty_committed += leagueStats.penalty.committed || 0;
                        defender.penalties_converted += leagueStats.penalty.scored || 0;
                        defender.penalties_total += (leagueStats.penalty.missed || 0) + defender.penalties_converted;
                        
                        // midfielder statistics
                        midfielder.goals += leagueStats.goals.total || 0;
                        midfielder.conceded += leagueStats.goals.conceded || 0;
                        midfielder.assists += leagueStats.goals.assists || 0;
                        midfielder.shots += leagueStats.shots.on || 0;
                        midfielder.total_shots += leagueStats.shots.total || 0;
                        midfielder.dribbles += leagueStats.dribbles.success || 0;
                        midfielder.total_dribbles += leagueStats.dribbles.attempts || 0;
                        midfielder.penalty_committed += leagueStats.penalty.committed || 0;
                        midfielder.penalty_drawn += leagueStats.penalty.won || 0;
                        midfielder.penalties_converted += leagueStats.penalty.scored || 0;
                        midfielder.penalties_total += (leagueStats.penalty.missed || 0) + midfielder.penalties_converted;

                        // attacker statistics
                        attacker.goals += leagueStats.goals.total || 0;
                        attacker.assists += leagueStats.goals.assists || 0;
                        attacker.shots += leagueStats.shots.on || 0;
                        attacker.total_shots += leagueStats.shots.total || 0;
                        attacker.dribbles += leagueStats.dribbles.success || 0;
                        attacker.total_dribbles += leagueStats.dribbles.attempts || 0;
                        attacker.penalty_drawn += leagueStats.penalty.won || 0;
                        attacker.penalties_converted += leagueStats.penalty.scored || 0;
                        attacker.penalties_total += (leagueStats.penalty.missed || 0) + attacker.penalties_converted;
                    });  
                    
                    // average any stats that need averaging
                    if(leagueCount > 0){
                        all_positions.rating /= leagueCount;
                        all_positions.rating = +all_positions.rating.toFixed(2);

                        all_positions.passAccuracy /= leagueCount;
                        all_positions.passAccuracy = +all_positions.passAccuracy.toFixed(2);
                    }

                    // create fractional strings for the relevant stats
                    if(all_positions.totalDuels > 0){
                        all_positions.duelsWon = `${all_positions.duelsWon}/${all_positions.totalDuels}`
                    }else{
                        all_positions.duelsWon = 0;
                    }

                    if(midfielder.total_dribbles > 0){
                        const dribblesString = `${midfielder.dribbles}/${midfielder.total_dribbles}`;
                        midfielder.dribbles = dribblesString;
                        attacker.dribbles = dribblesString;
                    }else{
                        midfielder.dribbles = 0;
                        attacker.dribbles = 0;
                    }

                    if(midfielder.total_shots > 0){
                        const shotsString = `${midfielder.shots}/${midfielder.total_shots}`;
                        midfielder.shots = shotsString;
                        attacker.shots = shotsString;
                    }else{
                        midfielder.shots = 0;
                        attacker.shots = 0;
                    }

                    if(defender.penalties_total > 0){
                        const penaltyString = `${defender.penalties_converted}/${defender.penalties_total}`;
                        defender.penalties_converted = penaltyString;
                        midfielder.penalties_converted = penaltyString;
                        attacker.penalties_converted = penaltyString;
                    }else{
                        defender.penalties_converted = 0;
                        midfielder.penalties_converted = 0;
                        attacker.penalties_converted = 0;
                    }

                    playerInfo.all_positions = all_positions;
                    playerInfo.goalkeeper = goalkeeper;
                    playerInfo.defender = defender;
                    playerInfo.midfielder = midfielder;
                    playerInfo.attacker = attacker;
                    
                    res.json(playerInfo);
                }else{
                    // data not available
                    res.json({});
                }
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

                    const status = match.fixture.status.short;

                    // FT = Full Time (match is over), PEN = Penalty (penalty shoot-out is over), AET = Added Extra Time (match is over) --> Add it to previous matches
                    if(status === 'FT' || status === 'PEN' || status === 'AET'){
                        previous[match.fixture.id] = {
                                                        home_team:      match.teams.home.name,
                                                        home_id:        match.teams.home.id,
                                                        home_logo:      match.teams.home.logo,
                                                        away_team:      match.teams.away.name,
                                                        away_id:        match.teams.away.id,
                                                        away_logo:      match.teams.away.logo,
                                                        date:           date,
                                                        time:           time,
                                                        status,
                                                        home_score: status === 'FT' ? match.score.fulltime.home : (status === 'PEN' ? match.score.penalty.home : match.score.extratime.home),
                                                        away_score: status === 'FT' ? match.score.fulltime.away : (status === 'PEN' ? match.score.penalty.away : match.score.extratime.away)
                                                    }
                        
                    }else if(status === 'NS' || status === 'TBD'){  // otherwise the game either hasn't occured or is ongoing --> Add it to upcoming matches (without scores)
                        upcoming[match.fixture.id] = {
                                                        home_team:      match.teams.home.name,
                                                        home_id:        match.teams.home.id,
                                                        home_logo:      match.teams.home.logo,
                                                        away_team:      match.teams.away.name,
                                                        away_id:        match.teams.away.id,
                                                        away_logo:      match.teams.away.logo,
                                                        date:           date,
                                                        time:           time,
                                                        status
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

    // fetches team logo
    app.get('/api/team-logo/:teamId', cache('24 hours'), async (req, res) => {
        const { teamId } = req.params;
        try {
            const response = await fetch(`https://media.api-sports.io/football/teams/${teamId}.png`);
            if (!response.ok) {
                throw new Error('ERROR: Unable to fetch team logo');
            }

            const arrayBuffer = await response.arrayBuffer();
            const logoBuffer = Buffer.from(arrayBuffer);

            res.setHeader('Content-Type', 'image/png');
            res.send(logoBuffer);
        } catch (error) {
            console.error('Error fetching team logo:', error);
        }
    });

    // fetches player picture
    app.get('/api/player-picture/:playerID', async (req, res) => {
        const { playerID } = req.params;
        try {
            const response = await fetch(`https://media.api-sports.io/football/players/${playerID}.png`);
            if (!response.ok) {
                throw new Error('ERROR: Unable to fetch team logo');
            }

            const arrayBuffer = await response.arrayBuffer();
            const logoBuffer = Buffer.from(arrayBuffer);

            res.setHeader('Content-Type', 'image/png');
            res.send(logoBuffer);
        } catch (error) {
            console.error('Error fetching team logo:', error);
        }
    });

    // fetches previous match statistics for both teams
    app.get('/api/matches/previous/stats/:matchID/:homeID/:awayID', cache('24 hours'), (req, res) => {
        const { matchID, homeID, awayID } = req.params;
        fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchID}`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            // parse the response and send ONLY relevant data to client
            const stats = data.response;
            if(stats.length > 0){
                const home = {};
                const away = {};
                /* home/away (string): Home/Away Team maps to     { team (string)            Team Name
                                                                    id (int)                 Team's API ID

                                                                    total_shots,
                                                                    shots_on_target,
                                                                    possession,
                                                                    total_passes,
                                                                    pass_accuracy,
                                                                    fouls,
                                                                    yellows,
                                                                    reds,
                                                                    offsides,
                                                                    corners
                                                                }
                */

                stats.forEach(teamStats => {
                    if(teamStats.team.id === parseInt(homeID)){
                        home.team = teamStats.team.name;
                        home.id = teamStats.team.id;
                        home.total_shots = teamStats.statistics[2].value || 0;
                        home.shots_on_target = teamStats.statistics[0].value || 0;
                        home.possession = teamStats.statistics[9].value || 0;
                        home.total_passes = teamStats.statistics[13].value || 0;
                        home.pass_accuracy = teamStats.statistics[15].value || 0;
                        home.fouls = teamStats.statistics[6].value || 0;
                        home.yellows = teamStats.statistics[10].value || 0;
                        home.reds = teamStats.statistics[11].value || 0;
                        home.offsides = teamStats.statistics[8].value || 0;
                        home.corners = teamStats.statistics[7].value || 0;
                    }else if(teamStats.team.id === parseInt(awayID)){
                        away.team = teamStats.team.name;
                        away.id = teamStats.team.id;
                        away.total_shots = teamStats.statistics[2].value || 0;
                        away.shots_on_target = teamStats.statistics[0].value || 0;
                        away.possession = teamStats.statistics[9].value || 0;
                        away.total_passes = teamStats.statistics[13].value || 0;
                        away.pass_accuracy = teamStats.statistics[15].value || 0;
                        away.fouls = teamStats.statistics[6].value || 0;
                        away.yellows = teamStats.statistics[10].value || 0;
                        away.reds = teamStats.statistics[11].value || 0;
                        away.offsides = teamStats.statistics[8].value || 0;
                        away.corners = teamStats.statistics[7].value || 0;
                    }
                });

                res.json( { home, away } );
            }else{
                // data not available
                res.json({});
            }
        })
        .catch(error => console.error(error));
    });

    // fetches previous match events for both teams
    app.get('/api/matches/previous/events/:matchID/:homeID/:awayID', cache('24 hours'), (req, res) => {
        const { matchID, homeID, awayID } = req.params;
        fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${matchID}`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            // parse the response and send ONLY relevant data to client
            const events = data.response;
            if(events.length > 0){
                const home = [];
                const away = [];
                
                events.forEach(event => {
                    // only display these events
                    if( event.detail === 'Normal Goal' || event.detail === 'Own Goal' || event.detail === 'Penalty' || event.detail === 'Yellow Card' || event.detail === 'Red Card'){
                        const eventData = {
                            type:       event.type,
                            detail:     event.detail,
                            time: event.time.elapsed + (event.time.extra || 0),
                            player: event.player.name || ('Player'),
                        };
                        if(event.team.id === parseInt(homeID)){
                            home.push(eventData);
                            

                        }else if(event.team.id === parseInt(awayID)){
                            away.push(eventData);
                        }
                    }
                });

                // sort events in chronological order
                home.sort((a, b) => a.time - b.time);
                away.sort((a, b) => a.time - b.time);

                res.json( { home, away } );
            }else{
                // data not available
                res.json({});
            }
        })
        .catch(error => console.error(error));
    });

    // fetches previous match head to head encounters between 2 teams
    app.get('/api/matches/h2h/:homeID/:awayID', cache('24 hours'), (req, res) => {
        const { homeID, awayID } = req.params;
        fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeID}-${awayID}`, options)
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
                const h2h = [];

                /* match_id (int): Match ID maps to     {   home_team (string)       Home Team
                                                            home_id (int)            Home Team's API ID
                                                            home_logo (URL)          Home Team's Logo

                                                            away_team (string)       Away Team
                                                            away_id (int)            Away Team's API ID
                                                            away_logo (URL)          Away Team's Logo

                                                            date (string)            Date of the match
                                                            time (string)            Time of the match

                                                            home_score (int)         Home Team's Goals (match finished)     
                                                            away_score (int)         Away Team's Goals (match finished)
                                                        }
                */

                for(const match of matches){
                    const status = match.fixture.status.short;

                    // FT = Full Time (match is over), PEN = Penalty (penalty shoot-out is over), AET = Added Extra Time (match is over) --> Add it to previous matches
                    if(status === 'FT' || status === 'PEN' || status === 'AET'){
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

                        const head2head =  {
                                                match_id:        match.fixture.id,
                                                home_team:      match.teams.home.name,
                                                home_id:        match.teams.home.id,
                                                home_logo:      match.teams.home.logo,
                                                away_team:      match.teams.away.name,
                                                away_id:        match.teams.away.id,
                                                away_logo:      match.teams.away.logo,
                                                date:           date,
                                                time:           time,
                                                status,
                                                home_score: status === 'FT' ? match.score.fulltime.home : (status === 'PEN' ? match.score.penalty.home : match.score.extratime.home),
                                                away_score: status === 'FT' ? match.score.fulltime.away : (status === 'PEN' ? match.score.penalty.away : match.score.extratime.away)
                                            }
                        
                        h2h.push(head2head);
                        }
                    }

                // sort matches in reverse-chronological order
                h2h.sort((a, b) => new Date(b.date) - new Date(a.date));
                res.json(h2h);
            }else{
                // data not available
                res.json({});
            }
        })
        .catch(error => console.error(error));
    });

    // fetches pre-match odds for a fixture
    app.get('/api/matches/odds/:matchID', cache('24 hours'), (req, res) => {
        const { matchID } = req.params;
        fetch(`https://v3.football.api-sports.io/odds?fixture=${matchID}&bookmaker=8`, options)
        .then(response => {
            if(!response.ok){
                throw new Error("ERROR: Bad Response");
            }else{
                return response.json();
            }
        })
        .then(data => {
            // parse the response and send ONLY relevant data to client
            if(data.response[0]){
                const oddsData = data.response[0].bookmakers[0].bets;
                
                const odds =    {
                                    matchWinnerOdds:    {
                                                            home_win:   parseFloat(oddsData[0].values[0].odd) || 0,
                                                            draw:       parseFloat(oddsData[0].values[1].odd) || 0,
                                                            away_win:   parseFloat(oddsData[0].values[2].odd) || 0
                                                        }
                                };

                res.json( {success: true, odds} );
            }else{
                // data not available
                res.json( {success: false} );
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