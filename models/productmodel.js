const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    productName: {
        type: String,
    },
    description: {
        type: String,
    },
    image: [
        {
            url: {
                type: String,
            }
        },
    ],
    price: {
        type: Number,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    rating: {
        type: Number,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            name: {
                type: String,
            },
            rating: {
                type: Number,
            },
            comment: {
                type: String,
            },
        },
    ],
    numOfReviews: {
        type: Number,
        default: 0,
    },
    size: [
        {
            type: String,
        },
    ],
    color: [
        {
            type: String,
        },
    ],
    stock: {
        type: Number,
    },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
