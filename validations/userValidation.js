const Joi = require('joi');


exports.registrationSchema = Joi.object({
    userName: Joi.string().required(),
    mobileNumber: Joi.string().required(),
    userType: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    referralCode: Joi.string().optional(),
});

exports.generateOtp = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

exports.otpSchema = Joi.object({
    userId: Joi.string().length(24).hex().required(),
    otp: Joi.string().length(5).required(),
});


exports.resendOtpSchema = Joi.object({
    userId: Joi.string().length(24).hex().required()
});

exports.loginSchema = Joi.object({
    userId: Joi.string().length(24).hex().required(),
    mobileNumber: Joi.string().required(),
});

exports.adminLoginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

exports.userIdSchema = Joi.object({
    userId: Joi.string().length(24).hex().required(),
});


exports.updateUserSchema = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    mobileNumber: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().optional(),
});


exports.updateUserProfileSchema = Joi.object({
    mobileNumber: Joi.string().optional(),
    name: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('Male', 'Female').optional(),
});