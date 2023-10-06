const Coupon = require('../models/couponModel');

const { couponSchema, couponIdSchema, updateCouponSchema } = require('../validations/couponValidation');



exports.createCoupon = async (req, res) => {
    try {
        const { error } = couponSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const { code, description, discountType, discountValue, startDate, expiryDate } = req.body;

        const checkCoupon = await Coupon.findOne({ code: code })
        if (checkCoupon) {
            return res.status(400).json({ status: 400, message: 'Coupon Code already exisit' });
        }

        const coupon = new Coupon({
            code,
            description,
            discountType,
            discountValue,
            startDate,
            expiryDate,
        });

        await coupon.save();

        return res.status(201).json({ status: 201, message: 'Coupon created successfully', data: coupon });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error creating coupon', error: error.message });
    }
};


exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();

        return res.status(200).json({ status: 200, message: 'Coupons retrieved successfully', data: coupons });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error retrieving coupons', error: error.message });
    }
};


exports.getCouponById = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        const { error } = couponIdSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        return res.status(200).json({ status: 200, message: 'Coupon retrieved successfully', data: coupon });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error retrieving coupon', error: error.message });
    }
};


exports.updateCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;
        const { code, description, discountType, discountValue, startDate, expiryDate } = req.body;

        const { error } = updateCouponSchema.validate({ couponId, code, description, discountType, discountValue, startDate, expiryDate });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const checkCoupon = await Coupon.findOne({ code: code })
        if (checkCoupon) {
            return res.status(400).json({ status: 400, message: 'Coupon Code already exisit' });
        }

        const coupon = await Coupon.findByIdAndUpdate(couponId, {
            code,
            description,
            discountType,
            discountValue,
            startDate,
            expiryDate,
        },
            { new: true });

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        return res.status(200).json({ status: 200, message: 'Coupon updated successfully', data: coupon });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error updating coupon', error: error.message });
    }
};


exports.getActiveCoupons = async (req, res) => {
    try {
        const currentDate = new Date();

        const activeCoupons = await Coupon.find({
            startDate: { $lte: currentDate },
            expiryDate: { $gte: currentDate },
        });

        return res.status(200).json({ status: 200, message: 'Active coupons retrieved successfully', data: activeCoupons });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching active coupons', error: error.message });
    }
};


exports.deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        const { error } = couponIdSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const coupon = await Coupon.findByIdAndRemove(couponId);

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        return res.status(200).json({ status: 200, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error deleting coupon', error: error.message });
    }
};



