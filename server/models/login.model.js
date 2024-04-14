const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },

        password: {
            type: String,
            required: true
        },

        points: {
            type: Number,
            required: true,
            default: 1000
        },

        last_daily_reward: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Login = mongoose.model('Login', LoginSchema);

module.exports = Login;