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
        const { userName, mobileNumber, email, password } = req.body;

        const { error } = registrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUserByMobile = await User.findOne({ mobileNumber });
        if (existingUserByMobile) {
            return res.status(400).json({ status: 400, message: 'User already exists with this mobile number' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ status: 400, message: 'User already exists with this email' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const referId = Math.floor(100000 + Math.random() * 900000);
        const referralCode = referId;

        const user = new User({
            userName,
            mobileNumber,
            otp: generateOtp(),
            referralCode,
            userType: "Vendor",
            email,
            password: hashedPassword,
            isVendorVerified: false,
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
        const { email, password } = req.body;

        const { error } = adminLoginSchema.validate({ email, password });
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findOne({ email, userType: "Vendor" });

        if (!user) {
            return res.status(401).json({ status: 401, message: 'User not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: 'Invalid password' });
        }

        if (!user.isVendorVerified) {
            return res.status(401).json({ status: 401, message: 'Vendor not verified; admin can verify' });
        }

        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });

        return res.status(200).json({ status: 200, message: 'Login successful', token, data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Login failed', error: error.message });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            return res.status(200).json({ status: 200, message: "get Profile", data: data });
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};


exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        const count = categories.length;

        return res.status(200).json({ status: 200, data: count, categories });
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


exports.getAllSubCategories = async (req, res) => {
    try {
        const subcategories = await SubCategory.find();

        const count = subcategories.length;

        return res.status(200).json({ status: 200, data: count, subcategories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching subcategories', error: error.message });
    }
};


exports.getSubCategoryById = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        const { error } = subCategoryIdSchema.validate({ subCategoryId });
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const subcategory = await SubCategory.findById(subCategoryId);

        if (!subcategory) {
            return res.status(404).json({ status: 404, message: 'Subcategory not found' });
        }

        return res.status(200).json({ status: 200, data: subcategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching subcategory by ID', error: error.message });
    }
};


exports.getSubCategoryByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const subCategories = await SubCategory.find({ categoryId }).populate('category');

        res.status(200).json({ status: 200, data: subCategories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching products by category', error: error.message });
    }
};


exports.createProduct = async (req, res) => {
    try {
        const userId = req.user._id;

        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const {
            productName,
            description,
            categoryId,
            subCategoryId,
            originalPrice,
            discount,
            discountActive,
            size,
            color,
            stock,
            status,
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

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

        let discountPrice = 0;
        if (discountActive === "true") {
            discountPrice = Number((originalPrice - (originalPrice * discount) / 100).toFixed(2));
        }


        const product = new Product({
            productName,
            description,
            image: images,
            originalPrice,
            discountPrice,
            discount,
            discountActive,
            categoryId,
            subCategoryId,
            size,
            color,
            stock,
            status,
            vendorId: user._id
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
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const products = await Product.find({ vendorId: userId }).populate('categoryId');
        const count = products.length;
        return res.status(200).json({ status: 200, data: count, products });

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


exports.updateProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        const { error } = updateProductSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        let updatedFields = {
            ...req.body
        };

        if (updatedFields.subCategoryId) {
            const subCategories = await SubCategory.findById(updatedFields.subCategoryId)

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

        if (updatedFields.discountActive === "true") {
            if (updatedFields.originalPrice && updatedFields.discount) {
                updatedFields.discountPrice = Number((updatedFields.originalPrice - (updatedFields.originalPrice * updatedFields.discount) / 100).toFixed(2));
            }
        } else {
            updatedFields.discountPrice = 0;
        }

        if (req.files && req.files.length > 0) {
            const images = req.files.map((file) => ({
                url: file.path,
            }));

            updatedFields.image = images;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, vendorId: user._id },
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
        const userId = req.user._id;

        const productId = req.params.productId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

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



exports.getAllOrders = async (req, res) => {
    try {
        const vendorId = req.user._id;

        const orders = await Order.find({ 'products.vendorId': vendorId })
            .populate({
                path: 'products.product',
                select: 'productName price image vendorId',
            })
            .populate({
                path: 'products.vendorId',
            })
            .populate({
                path: 'user',
                select: 'userName mobileNumber',
            })
            .populate({
                path: 'shippingAddress',
                select: 'fullName phone addressLine1 city state postalCode country isDefault',
            });

        const count = orders.length;

        return res.status(200).json({ status: 200, message: 'Vendor orders retrieved successfully', data: count, orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching vendor orders', error: error.message });
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
                path: 'products.vendorId',
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


exports.getCounts = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;

        const userCount = await User.countDocuments();

        const productCount = await Product.countDocuments({ vendorId });

        const orderCount = await Order.countDocuments({ 'products.vendorId': vendorId });

        const categoryCount = await Category.countDocuments();
        const subcategoryCount = await SubCategory.countDocuments();
        const notificationCount = await Notification.countDocuments();

        return res.status(200).json({
            status: 200,
            data: {
                users: userCount,
                products: productCount,
                orders: orderCount,
                categories: categoryCount,
                subcategories: subcategoryCount,
                notifications: notificationCount,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching counts', error: error.message });
    }
};

exports.getPendingProductForApproval = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const pendingProducts = await Product.find({ vendorId: userId, isProductVerified: false }).populate('vendorId');

        return res.status(200).json({ status: 200, message: 'Pending vendors Products retrieved successfully', data: pendingProducts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Failed to retrieve pending vendors Products', error: error.message });
    }
};


exports.getAllApprovedProducts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const approvedVendors = await Product.find({ vendorId: userId, isProductVerified: true });

        return res.status(200).json({ status: 200, message: 'Approved vendors Products retrieved successfully', data: approvedVendors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Failed to retrieve approved vendors', error: error.message });
    }
};


exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ recipients: { $in: [userId] } }).populate('recipients');

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};




