const Joi = require('joi');
const mongoose = require('mongoose');



exports.addToCartValidation = Joi.object({
    productId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.isValidObjectId(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required(),
    size: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
});


exports.updateCartValidation = Joi.object({
    productId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.isValidObjectId(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required(),
    size: Joi.string().optional(),
    quantity: Joi.number().integer().min(0).optional(),
});


exports.updateCartQuantityValidation = Joi.object({
    productId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.isValidObjectId(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required(),
    quantity: Joi.number().integer().min(1).required(),
});


