const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
    },
    code: {
        type: String,
        unique: true,
        trim: true,
    },
    discountPercentage: {
        type: Number,
    },
    validFrom: {
        type: Date,
    },
    validTo: {
        type: Date,
    },
});

module.exports = mongoose.model('Offer', offerSchema);
