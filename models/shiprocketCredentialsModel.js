const mongoose = require('mongoose');

const shiprocketCredentialsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    apiKey: {
        type: String,
    },
    apiSecret: {
        type: String,
    },
    liveSandbox: {
        type: String,
        enum: ["SANDBOX", "LIVE"],
        default: "SANDBOX"
    },
    isActive: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('ShiprocketCredentials', shiprocketCredentialsSchema);
