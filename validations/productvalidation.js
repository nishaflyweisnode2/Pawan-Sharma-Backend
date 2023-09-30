const Joi = require('joi');
const mongoose = require('mongoose');


// rating: Joi.number(),
// reviews: Joi.array().items(
//     Joi.object({
//         user: Joi.string().required(),
//         name: Joi.string().required(),
//         rating: Joi.number().required(),
//         comment: Joi.string().required(),
//     })
// ),
// image: Joi.array().items(
//     Joi.object({
//         url: Joi.string().required(),
//     })
// ),


exports.productSchema = Joi.object({
    productName: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    categoryId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.isValidObjectId(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required(),
    size: Joi.array().items(Joi.string()).required(),
    color: Joi.array().items(Joi.string()).required(),
    stock: Joi.number().required(),
});

exports.productIdSchema = Joi.object({
    productId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.isValidObjectId(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .required(),
});


exports.updateProductSchema = Joi.object({
    productName: Joi.string().optional(),
    description: Joi.string(),
    price: Joi.number().optional(),
    categoryId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.isValidObjectId(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .optional(),
    size: Joi.array().items(Joi.string()).optional(),
    color: Joi.array().items(Joi.string()).optional(),
    stock: Joi.number().optional(),
});
