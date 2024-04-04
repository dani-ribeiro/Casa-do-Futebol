require('dotenv').config();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const apicache = require('apicache');
const cache = apicache.middleware;

// import apicache from 'apicache'
const PORT = 3456;

// when client sends a GET request is made to /api --> send json
// app.get('/api', (req, res) => {
//     res.json({'users': ['userOne', 'userTwo', 'userThree', 'userFour']});
// });

const options = {
    method: 'GET',
    headers: {
        'x-apisports-host': 'v3.football.api-sports.io',
        'x-apisports-key': process.env.API_KEY2
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
                console.log(league);
                // no standings available
                res.json({});
            }
        }else{
            console.log(data);
            // no response
            res.json({});
        }
    })
    .catch(error => console.error(error));
});

app.post('/backend/signup', (req, res) => {
    const { username, password } = req.body;

    const validInputPattern = /^[A-Za-z0-9]+$/;

    if(!username || !password){
        res.json({  success: false,
                    error: 'Empty'});
    }else if(username.length > 36 || !validInputPattern.test(username) || !validInputPattern.test(password)){
        res.json({  success: false,
                    error: 'Invalid' });
    }else{
        console.log(username, password);
        res.json( {success: true, username, password});
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});