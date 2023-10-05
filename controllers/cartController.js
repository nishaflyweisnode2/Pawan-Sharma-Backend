const Cart = require('../models/cartModel');
const Product = require('../models/productmodel');
const SubCategory = require('../models/subCategoryModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');


const { addToCartValidation, updateCartValidation, updateCartQuantityValidation } = require('../validations/cartValidation');
const { createProduct } = require('./productController');



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
                products: [{ product: productId, size, quantity }],
            });
        } else {
            const existingProduct = cart.products.find(
                (item) => item.product.toString() === productId
            );

            if (existingProduct) {
                existingProduct.size = size;
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, size, quantity });
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

        const cart = await Cart.findOne({ user: userId }).populate('products.product', 'productName price');

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

        await cart.save();

        return res.status(200).json({ status: 200, message: 'Cart updated successfully', data: cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
};
