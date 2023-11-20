const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const Category = require('../models/categoryModel');
const SubCategory = require('../models/subCategoryModel');
const Product = require('../models/productmodel');
const Wishlist = require('../models/wishlistMiodel');
const Coupon = require('../models/couponModel');
const Offer = require('../models/offerModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');
const Payment = require('../models/paymentModel');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const Referral = require('../models/refferModel');
const Wallet = require('../models/walletModel');
const UserWallet = require('../models/walletModel');

const { walletBalanceSchema, updateWalletBalanceSchema } = require('../validations/walletValidation');



const { createPaymentSchema, paymentIdSchema, trackIdSchema, updatePaymentStatusSchema } = require('../validations/paymentValidation');




const { createOrderValidation, updateOrderStatusValidation, orderIdValidation } = require('../validations/orderValidation');

const { createOfferSchema, updateOfferSchema } = require('../validations/offerValidation');

const { couponSchema, couponIdSchema, updateCouponSchema } = require('../validations/couponValidation');

const { productSchema, productIdSchema, updateProductSchema, createProductReviewSchema, updateProductReviewSchema, getAllProductReviewsSchema, getProductReviewByIdSchema, deleteProductReviewSchema, addToWishlistSchema, removeFromWishlistSchema, categoryIdSchema, subCategoryIdSchema, searchSchema, getNewArrivalProductsSchema } = require('../validations/productvalidation');

const { subCategorySchema, /*subCategoryIdSchema,*/ updateSubCategorySchema } = require('../validations/subCategoryValidation');

const { categorySchema, /*categoryIdSchema,*/ updateCategorySchema } = require('../validations/categoryValidation');

const { registrationSchema, generateOtp, otpSchema, loginSchema, adminLoginSchema, resendOtpSchema, userIdSchema, updateUserSchema, updateUserProfileSchema } = require('../validations/userValidation');



exports.register = async (req, res) => {
    try {
        const { userName, mobileNumber, userType, email, password } = req.body;

        const { error } = registrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ $or: [{ mobileNumber }] });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'User already exists with this mobile' });
        }
        const referId = Math.floor(100000 + Math.random() * 900000);
        const referralCode = referId;

        const user = new User({
            userName,
            mobileNumber,
            otp: generateOtp(),
            referralCode,
            userType,
            email,
            password
        });

        await user.save();

        const welcomeMessage = `Welcome, ${user.userName}! Thank you for registering.`;
        const welcomeNotification = new Notification({
            recipient: user._id,
            content: welcomeMessage,
            type: 'welcome',
        });
        await welcomeNotification.save();


        return res.status(201).json({ status: 201, message: 'User registered successfully', data: user });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const userId = req.params.userId
        console.log("userId", userId);
        const { email, password } = req.body;

        const { error } = adminLoginSchema.validate({ email, password });
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ status: 401, message: 'User not found' });
        }

        user.isVerified = true;

        // user.otp = generateOtp()
        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME, });

        return res.status(200).json({ status: 200, message: 'Login successful', token: token, data: user, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Login failed', error: error.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(/*{ userType: 'User' }*/);
        return res.status(200).json({ status: 200, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching users', error: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching user', error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({ status: 200, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error deleting user', error: error.message });
    }
};


exports.createCategory = async (req, res) => {
    try {
        const { error } = categorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const { name } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const category = new Category({
            name,
            image: req.file.path,
        });

        await category.save();

        return res.status(201).json({ status: 201, message: 'Category created successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category creation failed', error: error.message });
    }
};


exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ status: 200, data: categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching categories', error: error.message });
    }
};


exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const { error } = categoryIdSchema.validate({ categoryId });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching category', error: error.message });
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { name } = req.body;

        const { error } = updateCategorySchema.validate({ categoryId, name });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const category = await Category.findByIdAndUpdate(categoryId, { name, image: req.file.path, }, { new: true });

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Category updated successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category update failed', error: error.message });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const { error } = categoryIdSchema.validate({ categoryId });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category deletion failed', error: error.message });
    }
};


exports.createSubCategory = async (req, res) => {
    try {
        const { category, name } = req.body;

        const { error } = subCategorySchema.validate({ category, name });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const categories = await Category.findById(category)

        if (!categories) {
            return res.status(404).json({ status: 404, message: "categories not found" });

        }

        const subcategory = new SubCategory({
            category,
            name,
            image: req.file.path,
        });

        await subcategory.save();

        return res.status(201).json({ status: 201, message: 'Subcategory created successfully', data: subcategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Subcategory creation failed', error: error.message });
    }
};


exports.getAllSubCategories = async (req, res) => {
    try {
        const subcategories = await SubCategory.find();
        return res.status(200).json({ status: 200, data: subcategories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching subcategories', error: error.message });
    }
};


exports.getSubCategoryById = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;

        const { error } = subCategoryIdSchema.validate({ subcategoryId });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const subcategory = await SubCategory.findById(subcategoryId);

        if (!subcategory) {
            return res.status(404).json({ status: 404, message: 'Subcategory not found' });
        }

        return res.status(200).json({ status: 200, data: subcategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching subcategory by ID', error: error.message });
    }
};


exports.updateSubCategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const { category, name } = req.body

        const { error } = updateSubCategorySchema.validate({ subcategoryId, category, name });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const subCategories = await SubCategory.findById(subcategoryId)

        if (!subCategories) {
            return res.status(404).json({ status: 404, message: "subCategories not found" });
        }

        if (category) {
            const categories = await Category.findById(req.body.category)
            if (!categories) {
                return res.status(404).json({ status: 404, message: "categories not found" });
            }
        }

        const updatedSubcategory = await SubCategory.findByIdAndUpdate(subcategoryId, { ...req.body, image: req.file.path, }, { new: true });

        if (!updatedSubcategory) {
            return res.status(404).json({ status: 404, message: 'Subcategory not found' });
        }

        return res.status(200).json({ status: 200, message: 'Subcategory updated successfully', data: updatedSubcategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Subcategory update failed', error: error.message });
    }
};


exports.deleteSubCategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;

        const { error } = subCategoryIdSchema.validate({ subcategoryId });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const deletedSubcategory = await SubCategory.findByIdAndDelete(subcategoryId);

        if (!deletedSubcategory) {
            return res.status(404).json({ status: 404, message: 'Subcategory not found' });
        }

        return res.status(200).json({ status: 200, message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Subcategory deletion failed', error: error.message });
    }
};


exports.createProduct = async (req, res) => {
    try {
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const {
            productName,
            description,
            price,
            categoryId,
            subCategoryId,
            size,
            color,
            stock,
        } = req.body;

        const images = req.files.map((file) => ({
            url: file.path,
        }));

        const subCategories = await SubCategory.findById(subCategoryId)

        if (!subCategories) {
            return res.status(404).json({ status: 404, message: "subCategories not found" });
        }
        const categories = await Category.findById(categoryId)
        if (!categories) {
            return res.status(404).json({ status: 404, message: "categories not found" });
        }

        const product = new Product({
            productName,
            description,
            image: images,
            price,
            categoryId,
            subCategoryId,
            size,
            color,
            stock,
        });

        await product.save();

        return res.status(201).json({ status: 201, message: 'Product created successfully', data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Product creation failed', error: error.message });
    }
};


exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ status: 200, data: products });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching products', error: error.message });
    }
};


exports.getAllProductsByAdmin = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ status: 200, data: products });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching products', error: error.message });
    }
};


exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { error } = productIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        return res.status(200).json({ status: 200, data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching product by ID', error: error.message });
    }
};


exports.forAdminGetProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { error } = productIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        return res.status(200).json({ status: 200, data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching product by ID', error: error.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { error } = updateProductSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }


        let updatedFields = {
            ...req.body
        };

        if (updatedFields.subCategoryId) {
            const subCategories = await SubCategory.findById(updatedFields.subcategoryId)

            if (!subCategories) {
                return res.status(404).json({ status: 404, message: "subCategories not found" });
            }
        }

        if (updatedFields.categoryId) {
            const categories = await Category.findById(updatedFields.categoryId)
            if (!categories) {
                return res.status(404).json({ status: 404, message: "categories not found" });
            }
        }
        if (updatedFields.subCategoryId) {
            const subCategories = await Category.findById(updatedFields.subCategoryId)
            if (!subCategories) {
                return res.status(404).json({ status: 404, message: "subCategories not found" });
            }
        }

        if (req.files && req.files.length > 0) {
            const images = req.files.map((file) => ({
                url: file.path,
            }));

            updatedFields.image = images;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updatedFields,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        return res.status(200).json({ status: 200, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Product update failed', error: error.message });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        return res.status(200).json({ status: 200, message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Product deletion failed', error: error.message });
    }
};


exports.createProductReview = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { rating, comment } = req.body;

        const { error } = createProductReviewSchema.validate({ productId, rating, comment });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const userId = req.user.id;

        const userCheck = await User.findById(userId);

        if (!userCheck) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const review = {
            user: userCheck._id,
            name: userCheck.userName,
            rating,
            comment,
        };

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        product.reviews.push(review);

        const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const newNumOfReviews = product.reviews.length;
        const newAvgRating = totalRatings / newNumOfReviews;

        product.rating = newAvgRating;
        product.numOfReviews = newNumOfReviews;

        await product.save();

        return res.status(201).json({ status: 201, message: 'Product review added successfully', data: product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Product review creation failed', error: error.message });
    }
};


exports.getAllProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;

        const { error } = getAllProductReviewsSchema.validate({ productId });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const reviews = product.reviews;

        res.status(200).json({ status: 200, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching product reviews', error: error.message });
    }
};


exports.getProductReviewById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const reviewId = req.params.reviewId;

        const { error } = getProductReviewByIdSchema.validate({ productId, reviewId });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const review = product.reviews.id(reviewId);

        if (!review) {
            return res.status(404).json({ status: 404, message: 'Review not found' });
        }

        res.status(200).json({ status: 200, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching product review', error: error.message });
    }
};


exports.updateProductReview = async (req, res) => {
    try {
        const productId = req.params.productId;
        const reviewId = req.params.reviewId;
        const { rating, comment } = req.body;

        const { error } = updateProductReviewSchema.validate({ productId, reviewId, rating, comment });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const review = product.reviews.id(reviewId);

        if (!review) {
            return res.status(404).json({ status: 404, message: 'Review not found' });
        }

        review.rating = rating;
        review.comment = comment;

        const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvgRating = totalRatings / product.numOfReviews;

        product.rating = newAvgRating;

        await product.save();

        res.status(200).json({ status: 200, message: 'Product review updated successfully', data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Product review update failed', error: error.message });
    }
};


exports.deleteProductReview = async (req, res) => {
    try {
        const productId = req.params.productId;
        const reviewId = req.params.reviewId;

        const { error } = deleteProductReviewSchema.validate({ productId, reviewId });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const reviewIndex = product.reviews.findIndex((review) => review._id.toString() === reviewId);

        if (reviewIndex === -1) {
            return res.status(404).json({ status: 404, message: 'Review not found' });
        }

        product.reviews.splice(reviewIndex, 1);

        product.numOfReviews -= 1;

        if (product.numOfReviews > 0) {
            const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
            const newAvgRating = totalRatings / product.numOfReviews;
            product.rating = newAvgRating;
        } else {
            product.rating = 0;
        }

        await product.save();

        res.status(200).json({ status: 200, message: 'Product review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Product review deletion failed', error: error.message });
    }
};


exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const { error } = categoryIdSchema.validate({ categoryId });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const products = await Product.find({ categoryId });

        res.status(200).json({ status: 200, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching products by category', error: error.message });
    }
};


exports.getProductsBySubCategory = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        const { error } = subCategoryIdSchema.validate({ subCategoryId });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const products = await Product.find({ subCategoryId });

        res.status(200).json({ status: 200, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching products by category', error: error.message });
    }
};


exports.searchProducts = async (req, res) => {
    try {
        const { search } = req.query;

        const { error } = searchSchema.validate({ search });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const productsCount = await Product.count();
        if (search) {
            let data1 = [
                {
                    $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" },
                },
                { $unwind: "$categoryId" },
                {
                    $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryId", },
                },
                { $unwind: "$subCategoryId" },
                {
                    $match: {
                        $or: [
                            { "categoryId.name": { $regex: search, $options: "i" }, },
                            { "subCategoryId.name": { $regex: search, $options: "i" }, },
                            { "productName": { $regex: search, $options: "i" }, },
                            { "description": { $regex: search, $options: "i" }, },
                        ]
                    }
                },
                { $sort: { numOfReviews: -1 } }
            ]
            let apiFeature = await Product.aggregate(data1);
            return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
        } else {
            let apiFeature = await Product.aggregate([
                { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" } },
                { $unwind: "$categoryId" },
                { $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryId", }, },
                { $unwind: "$subCategoryId" },
                { $sort: { numOfReviews: -1 } }
            ]);

            return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error searching products', error: error.message });
    }
};


exports.paginateProductSearch = async (req, res) => {
    try {
        const { search, fromDate, toDate, categoryId, subCategoryId, status, page, limit } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { "productName": { $regex: req.query.search, $options: "i" }, },
                { "description": { $regex: req.query.search, $options: "i" }, },
            ]
        }
        if (status) {
            query.status = status
        }
        if (subCategoryId) {
            query.subCategoryId = subCategoryId
        }
        if (categoryId) {
            query.categoryId = categoryId
        }
        if (fromDate && !toDate) {
            query.createdAt = { $gte: fromDate };
        }
        if (!fromDate && toDate) {
            query.createdAt = { $lte: toDate };
        }
        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: fromDate } },
                { createdAt: { $lte: toDate } },
            ]
        }
        let options = {
            page: Number(page) || 1,
            limit: Number(limit) || 15,
            sort: { createdAt: -1 },
            populate: ('categoryId subCategoryId')
        };
        let data = await Product.paginate(query, options);
        return res.status(200).json({ status: 200, message: "Product data found.", data: data });

    } catch (err) {
        return res.status(500).send({ msg: "internal server error ", error: err.message, });
    }
};


exports.createCoupon = async (req, res) => {
    try {
        const { code, description, discountType, discountValue, startDate, expiryDate } = req.body;

        const { error } = couponSchema.validate({ code, description, discountType, discountValue, startDate, expiryDate });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const checkCoupon = await Coupon.findOne({ code: code })
        if (checkCoupon) {
            return res.status(400).json({ status: 400, message: 'Coupon Code already exisit' });
        }

        const coupon = new Coupon({
            code,
            image: req.file.path,
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


exports.getAllCouponsForAdmin = async (req, res) => {
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
        const updateFields = {};
        if (req.body.code) updateFields.code = req.body.code;
        if (req.body.description) updateFields.description = req.body.description;
        if (req.body.discountType) updateFields.discountType = req.body.discountType;
        if (req.body.discountValue) updateFields.discountValue = req.body.discountValue;
        if (req.body.startDate) updateFields.startDate = req.body.startDate;
        if (req.body.expiryDate) updateFields.expiryDate = req.body.expiryDate;

        const { error } = updateCouponSchema.validate({
            couponId,
            code: req.body.code,
            description: req.body.description,
            discountType: req.body.discountType,
            discountValue: req.body.discountValue,
            startDate: req.body.startDate,
            expiryDate: req.body.expiryDate,
        });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (req.file) {
            updateFields.image = req.file.path;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: "No valid fields to update" });
        }

        existingCoupon = await Coupon.findById(couponId);

        if (!existingCoupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        if (updateFields.code !== existingCoupon.code) {
            const checkCoupon = await Coupon.findOne({ code: updateFields.code });
            if (checkCoupon) {
                return res.status(400).json({ status: 400, message: 'Coupon Code already exists' });
            }
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateFields, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, message: 'Coupon updated successfully', data: updatedCoupon });
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


exports.createOffer = async (req, res) => {
    try {
        const { error } = createOfferSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const { product, title, description, code, discountPercentage, validFrom, validTo } = req.body;

        const checkProduct = await Product.findById(product);

        if (!checkProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found' });
        }

        const checkOffer = await Offer.findOne({ title });

        if (checkOffer) {
            return res.status(404).json({ status: 404, message: 'Title exist with this name' });
        }

        const offer = new Offer({
            product,
            title,
            image: req.file.path,
            description,
            code,
            discountPercentage,
            validFrom,
            validTo,
        });

        await offer.save();

        return res.status(201).json({ status: 201, message: 'Offer created successfully', data: offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error creating offer', error: error.message });
    }
};


exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find();
        return res.status(200).json({ status: 200, data: offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching offers', error: error.message });
    }
};


exports.getAllOffersForAdmin = async (req, res) => {
    try {
        const offers = await Offer.find();
        return res.status(200).json({ status: 200, data: offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching offers', error: error.message });
    }
};


exports.getOfferById = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, data: offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching offer', error: error.message });
    }
};


exports.updateOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const updateFields = {};
        if (req.body.product) updateFields.product = req.body.product;
        if (req.body.title) updateFields.title = req.body.title;
        if (req.body.description) updateFields.description = req.body.description;
        if (req.body.code) updateFields.code = req.body.code;
        if (req.body.discountPercentage) updateFields.discountPercentage = req.body.discountPercentage;
        if (req.body.validFrom) updateFields.validFrom = req.body.validFrom;
        if (req.body.validTo) updateFields.validTo = req.body.validTo;

        const { error } = updateOfferSchema.validate({
            offerId,
            product: req.body.product,
            title: req.body.title,
            description: req.body.description,
            code: req.body.code,
            discountPercentage: req.body.discountPercentage,
            validFrom: req.body.validFrom,
            validTo: req.body.validTo,
        });

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        if (req.body.product) {
            const checkProduct = await Product.findById(req.body.product);

            if (!checkProduct) {
                return res.status(404).json({ status: 404, message: 'Product not found' });
            }
        }

        if (req.body.title) {
            const checkOffer = await Offer.findOne({ title });

            if (checkOffer) {
                return res.status(404).json({ status: 404, message: 'Title exist with this name' });
            }
        }

        if (req.file) {
            updateFields.image = req.file.path;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ status: 400, message: "No valid fields to update" });
        }

        const offer = await Offer.findByIdAndUpdate(offerId, updateFields, { new: true });

        if (!offer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, message: 'Offer updated successfully', data: offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error updating offer', error: error.message });
    }
};


exports.deleteOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await Offer.findByIdAndRemove(offerId);

        if (!offer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, message: 'Offer deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error deleting offer', error: error.message });
    }
};


exports.createNotification = async (req, res) => {
    try {
        const { recipient, content } = req.body;

        const notification = new Notification({ recipient, content });
        await notification.save();

        return res.status(201).json({ status: 201, message: 'Notification created successfully', data: notification });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error creating notification', error: error.message });
    }
};


exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ recipient: userId });

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'products.product',
                select: 'productName price image',
            })
            .populate({
                path: 'user',
                select: 'userName mobileNumber',
            })
            .populate({
                path: 'shippingAddress',
                select: 'fullName phone addressLine1 city state postalCode country isDefault',
            });
        return res.status(200).json({ status: 200, message: 'Orders retrieved successfully', data: orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching orders', error: error.message });
    }
};


exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const { error } = orderIdValidation.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }
        const order = await Order.findById(orderId)
            .populate({
                path: 'products.product',
                select: 'productName price image',
            })
            .populate({
                path: 'user',
                select: 'userName mobileNumber',
            })
            .populate({
                path: 'shippingAddress',
                select: 'fullName phone addressLine1 city state postalCode country isDefault',
            });

        if (!order) {
            return res.status(404).json({ status: 404, message: 'Order not found' });
        }

        return res.status(200).json({ status: 200, message: 'Order retrieved successfully', data: order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching order', error: error.message });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const { error } = updateOrderStatusValidation.validate({ orderId, status });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ status: 404, message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({ status: 200, message: 'Order status updated successfully', data: order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error updating order status', error: error.message });
    }
};


exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', 'userName mobileNumber image').populate('order').populate('wallet');

        return res.status(200).json({ status: 200, message: 'Payments retrieved successfully', data: payments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error retrieving payments', error: error.message });
    }
};


exports.getPaymentDetails = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;

        const { error } = paymentIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const payment = await Payment.findById(paymentId).populate('user', 'userName mobileNumber image').populate('order').populate('wallet');

        if (!payment) {
            return res.status(404).json({ status: 404, message: 'Payment record not found' });
        }

        return res.status(200).json({ status: 200, message: 'Payment details retrieved successfully', data: payment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error retrieving payment details', error: error.message });
    }
};


exports.updatePaymentStatus = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const { status } = req.body;

        const { error } = updatePaymentStatusSchema.validate({ paymentId, status });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });

        if (!payment) {
            return res.status(404).json({ status: 404, message: 'Payment record not found' });
        }

        if (status === 'Completed') {
            const order = await Order.findOne({ _id: payment.order });
            if (order) {
                order.paymentStatus = 'Completed';
                await order.save();
            }
        } else if (status === 'Failed') {
            const order = await Order.findOne({ _id: payment.order });
            if (order) {
                order.paymentStatus = 'Failed';
                await order.save();
            }
        } else if (status === 'Pending') {
            const order = await Order.findOne({ _id: payment.order });
            if (order) {
                order.paymentStatus = 'Pending';
                await order.save();
            }
        }


        return res.status(200).json({ status: 200, message: 'Payment status updated successfully', data: payment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error updating payment status', error: error.message });
    }
};


exports.deletePayment = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;

        const { error } = paymentIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const payment = await Payment.findByIdAndRemove(paymentId);

        if (!payment) {
            return res.status(404).json({ status: 404, message: 'Payment record not found' });
        }

        return res.status(204).json();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error deleting payment record', error: error.message });
    }
};


exports.getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find();
        res.status(200).json({ status: 200, data: referrals });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};


exports.updateReferralStatus = async (req, res) => {
    try {
        const { referralId } = req.params;
        const { status, reward } = req.body;

        const referral = await Referral.findById(referralId);
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        if (status === 'Approved') {
            const referrerUser = await User.findById(referral.referrer);

            if (referrerUser) {
                let referrerWallet = await Wallet.findOne({ user: referrerUser._id });

                if (!referrerWallet) {
                    referrerWallet = new Wallet({ user: referrerUser._id, balance: 0 });
                }

                referrerWallet.balance += reward || 0;
                await referrerWallet.save();
            }
        }

        referral.status = status;
        referral.reward = reward || 0;
        await referral.save();


        res.status(200).json({ message: 'Referral updated successfully', data: referral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.getReferralById = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.referralId);
        if (!referral) {
            return res.status(404).json({ status: 404, message: 'Referral not found' });
        }
        res.status(200).json({ status: 200, data: referral });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};


exports.deleteReferral = async (req, res) => {
    try {
        const referral = await Referral.findByIdAndRemove(req.params.referralId);
        if (!referral) {
            return res.status(404).json({ status: 404, message: 'Referral not found' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};


exports.createUserWallet = async (req, res) => {
    try {
        const { userId } = req.params;

        const { error } = walletBalanceSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const existingWallet = await UserWallet.findOne({ user: userId });
        if (existingWallet) {
            return res.status(400).json({ status: 400, message: 'User wallet already exists' });
        }

        const userWallet = new UserWallet({ user: userId });
        await userWallet.save();

        return res.status(201).json({ status: 201, message: 'User wallet created successfully', data: userWallet });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error creating user wallet', error: error.message });
    }
};


exports.updateWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        const { error } = updateWalletBalanceSchema.validate({ userId, amount });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userWallet = await UserWallet.findOne({ user: userId });

        if (!userWallet) {
            return res.status(404).json({ status: 404, message: 'User wallet not found' });
        }

        userWallet.balance += amount;
        await userWallet.save();

        return res.status(200).json({ status: 200, message: 'Wallet balance updated successfully', data: userWallet.balance });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error updating wallet balance', error: error.message });
    }
};


exports.getWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userWallet = await UserWallet.findOne({ user: userId });
        if (!userWallet) {
            return res.status(404).json({ status: 404, message: 'User wallet not found' });
        }

        return res.status(200).json({ status: 200, message: 'Wallet balance retrieved successfully', data: userWallet.balance });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error retrieving wallet balance', error: error.message });
    }
};


exports.getAllUserWalletBalances = async (req, res) => {
    try {
        const userWallets = await UserWallet.find().populate('user', 'userName');

        if (!userWallets || userWallets.length === 0) {
            return res.status(404).json({ status: 404, message: 'No user wallets found' });
        }

        const userWalletBalances = userWallets.map(wallet => ({
            userId: wallet.user._id,
            username: wallet.user.userName,
            balance: wallet.balance,
        }));

        return res.status(200).json({ status: 200, message: 'User wallet balances retrieved successfully', data: userWalletBalances });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error retrieving user wallet balances', error: error.message });
    }
};


exports.deleteWallet = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userWallet = await UserWallet.findOne({ user: userId });

        if (!userWallet) {
            return res.status(404).json({ status: 404, message: 'User wallet not found' });
        }

        await UserWallet.findByIdAndRemove(userWallet._id);

        return res.status(204).json({ status: 204, message: "Wallet Deleted Sucessfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error deleting wallet', error: error.message });
    }
};




