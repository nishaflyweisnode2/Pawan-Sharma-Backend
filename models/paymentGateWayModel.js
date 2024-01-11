const mongoose = require('mongoose');

const paymentGatewaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    apiKey: {
        type: String,
        required: true,
    },
    secretKey: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    liveSandbox: {
        type: String,
        enum: ["SANDBOX", "LIVE"],
        default: "SANDBOX"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PaymentGateway = mongoose.model('PaymentGateway', paymentGatewaySchema);

module.exports = PaymentGateway;
