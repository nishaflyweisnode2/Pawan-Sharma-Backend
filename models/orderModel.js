const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            size: {
                type: String
            },
            quantity: {
                type: Number,
            },
            price: {
                type: Number,
            },
        },
    ],
    totalAmount: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Online', 'Cash on Delivery'],
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    },
    trackingNumber: {
        type: String,
        unique: true,
    },
    refundStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed'],
        default: 'Pending',
    },
    isRefund: {
        type: Boolean,
        default: false,
    },
    refundReason: {
        type: String,
    },
    refundDescription: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
