const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const BetSchema = mongoose.Schema(
    {
        match_id: {
            type: Number,
            required: true
        },

        bettor: {
            type: String,
            required: true,
        },

        bettor_id: {
            type: ObjectId,
            required: true
        },

        wager_amount: {
            type: Number,
            required: true
        },

        potential_payout: {
            type: Number,
            default: 0
        },

        actual_payout: {
            type: Number,
            default: 0
        },

        // Won, Lost, In Progress
        status: {
            type: String,
            required: true
        },

        match_date: {
            type: Date,
            required: true
        },

        bet_match_winner: {
            type: String
        },

        odds_bet_match_winner: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

const Bet = mongoose.model('Bet', BetSchema);

module.exports = Bet;