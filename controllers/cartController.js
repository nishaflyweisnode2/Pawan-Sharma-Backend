const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/productmodel');
const SubCategory = require('../models/subCategoryModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');


const { addToCartValidation, updateCartValidation, updateCartQuantityValidation, applyCouponValidation, updateApplyCouponValidation } = require('../validations/cartValidation');



exports.addToCart = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;
        const userId = req.user.id;

        const { error } = addToCartValidation.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                products: [{ product: productId, size, quantity, price: product.price, totalAmount: product.price * quantity }],

            });
        } else {
            const existingProduct = cart.products.find(
                (item) => item.product.toString() === productId
            );

            if (existingProduct) {
                existingProduct.size = size;
                existingProduct.quantity += quantity;
                existingProduct.totalAmount = existingProduct.price * existingProduct.quantity;
            } else {
                cart.products.push({ product: productId, size, quantity, price: product.price, totalAmount: product.price * quantity });
            }
        }

        await cart.save();
        return res.status(201).json({ status: 2001, message: 'Product added to cart successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding product to cart', error: error.message });
    }
};


exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'products.product',
            select: 'productName price',
        }).populate('coupon', 'code description discountValue');

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        return res.status(200).json({ status: 200, message: 'Cart retrieved successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
};


exports.updateCart = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;
        const userId = req.user.id;

        const { error } = updateCartValidation.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        const cartProduct = cart.products.find(
            (item) => item.product.toString() === productId);

        if (!cartProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found in cart' });
        }

        cartProduct.size = size;
        cartProduct.quantity = quantity;
        cartProduct.totalAmount = product.price * quantity;

        await cart.save();

        return res.status(200).json({ status: 200, message: 'Cart updated successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
};


exports.deleteCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOneAndDelete({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        return res.status(200).json({ status: 200, message: 'Cart cleared successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
};


exports.updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const { error } = updateCartQuantityValidation.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        const cartProduct = cart.products.find(
            (item) => item.product.toString() === productId
        );

        if (!cartProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found in cart' });
        }

        cartProduct.quantity = quantity;
        cartProduct.totalAmount = product.price * quantity;


        await cart.save();

        return res.status(200).json({ status: 200, message: 'Cart updated successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
};


exports.deleteCartProductById = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ status: 404, message: 'Product not found in cart' });
        }

        cart.products.splice(productIndex, 1);

        await cart.save();

        return res.status(200).json({ status: 200, message: 'Cart product deleted successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting cart product', error: error.message });
    }
};


exports.applyCouponToCart = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.user.id;

        const { error } = applyCouponValidation.validate({ couponCode });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        const coupon = await Coupon.findOne({
            code: couponCode,
            startDate: { $lte: new Date() },
            expiryDate: { $gte: new Date() },
        });

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found or expired' });
        }

        const discountAmount = coupon.discountValue;

        const totalAmountBeforeDiscount = cart.products.reduce(
            (total, product) => total + product.price * product.quantity,
            0
        );

        let totalAmountAfterDiscount = totalAmountBeforeDiscount;

        if (coupon.discountType === 'percentage') {
            const discountPercentage = (discountAmount / 100);
            totalAmountAfterDiscount = totalAmountBeforeDiscount - (totalAmountBeforeDiscount * discountPercentage);
        } else {
            totalAmountAfterDiscount -= discountAmount;
        }

        const cartProduct = cart.products.find(
            (item) => item.product.toString()
        );

        if (!cartProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found in cart' });
        }

        cartProduct.totalAmount = totalAmountAfterDiscount

        cart.totalAmount = totalAmountAfterDiscount;

        cart.coupon = coupon._id;

        await cart.save();

        return res.status(200).json({ status: 200, message: 'Coupon applied successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error applying coupon to cart', error: error.message });
    }
};


exports.updateCartCoupon = async (req, res) => {
    try {
        const userId = req.user.id;
        const couponId = req.body.couponId;

        const { error } = updateApplyCouponValidation.validate({ couponId });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        const coupon = await Coupon.findOne({
            _id: couponId,
            startDate: { $lte: new Date() },
            expiryDate: { $gte: new Date() },
        });

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found or expired' });
        }
        const discountAmount = coupon.discountValue;

        const totalAmountBeforeDiscount = cart.products.reduce(
            (total, product) => total + product.price * product.quantity,
            0
        );

        let totalAmountAfterDiscount = totalAmountBeforeDiscount;

        if (coupon.discountType === 'percentage') {
            const discountPercentage = (discountAmount / 100);
            totalAmountAfterDiscount = totalAmountBeforeDiscount - (totalAmountBeforeDiscount * discountPercentage);
        } else {
            totalAmountAfterDiscount -= discountAmount;
        }

        const cartProduct = cart.products.find(
            (item) => item.product.toString()
        );

        if (!cartProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found in cart' });
        }

        cartProduct.totalAmount = totalAmountAfterDiscount

        cart.totalAmount = totalAmountAfterDiscount;

        cart.coupon = coupon._id;

        await cart.save();

        return res.status(200).json({ status: 200, message: 'Cart coupon updated successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating cart coupon', error: error.message });
    }
};


exports.removeCartCoupon = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ status: 404, message: 'Cart not found' });
        }

        if (!cart.coupon) {
            return res.status(404).json({ status: 404, message: 'No coupon applied to the cart' });
        }

        const coupon = await Coupon.findOne({
            _id: cart.coupon,
            startDate: { $lte: new Date() },
            expiryDate: { $gte: new Date() },
        });

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found or expired' });
        }

        const totalAmountBeforeDiscount = cart.products.reduce(
            (total, product) => total + product.price * product.quantity,
            0
        );

        let totalAmountAfterDiscount = totalAmountBeforeDiscount;

        if (coupon.discountType === 'percentage') {
            const discountPercentage = coupon.discountValue / 100;
            totalAmountAfterDiscount = totalAmountBeforeDiscount / (1 - discountPercentage);
        } else {
            totalAmountAfterDiscount -= coupon.discountValue;
        }

        cart.products.forEach((product) => {
            product.totalAmount = (product.price * product.quantity);
        });

        cart.totalAmount = totalAmountAfterDiscount;
        cart.coupon = null;

        await cart.save();

        return res.status(200).json({ status: 200, message: 'Cart coupon removed successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error removing cart coupon', error: error.message });
    }
};




