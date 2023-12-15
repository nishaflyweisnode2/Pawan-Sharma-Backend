const auth = require("../controllers/vendorController");
const express = require("express");
const router = express()


const authJwt = require("../middleware/auth");


const { profileImage, categoryImage, subCategoryImage, productImage, couponImage, offerImage } = require('../middleware/imageUpload');




module.exports = (app) => {

    // api/user/

    app.post('/api/vendor/register', auth.register);
    app.post('/api/vendor/login', auth.login)
    app.get('/api/vendor/getProfile', authJwt.isVendor, auth.getProfile);
    app.get('/api/vendor/categories', [authJwt.isVendor], auth.getAllCategories);
    app.get('/api/vendor/categories/:categoryId', [authJwt.isVendor], auth.getCategoryById);
    app.get('/api/vendor/subcategories', [authJwt.isVendor], auth.getAllSubCategories);
    app.get('/api/vendor/subcategories/:subCategoryId', [authJwt.isVendor], auth.getSubCategoryById);
    app.get('/api/vendor/subcategories/categoryId/:categoryId', [authJwt.isVendor], auth.getSubCategoryByCategory);
    app.post('/api/vendor/products', [authJwt.isVendor], productImage.array('image'), auth.createProduct);
    app.get('/api/vendor/products', [authJwt.isVendor], auth.getAllProducts);
    app.get('/api/vendor/products/:productId', [authJwt.isVendor], auth.getProductById);
    app.put('/api/vendor/products/:productId', [authJwt.isVendor], productImage.array('image'), auth.updateProduct);
    app.delete('/api/vendor/products/:productId', [authJwt.isVendor], auth.deleteProduct);
    app.post('/api/vendor/products/:productId/reviews', [authJwt.isVendor], auth.createProductReview);
    app.get('/api/vendor/products/:productId/reviews', [authJwt.isVendor], auth.getAllProductReviews);
    app.get('/api/vendor/products/:productId/reviews/:reviewId', [authJwt.isVendor], auth.getProductReviewById);
    app.put('/api/vendor/products/:productId/reviews/:reviewId', [authJwt.isVendor], auth.updateProductReview);
    app.delete('/api/vendor/products/:productId/reviews/:reviewId', [authJwt.isVendor], auth.deleteProductReview);
    app.get('/api/vendor/products/category/:categoryId', [authJwt.isVendor], auth.getProductsByCategory);
    app.get('/api/vendor/products/subCategoryId/:subCategoryId', [authJwt.isVendor], auth.getProductsBySubCategory);
    app.get('/api/vendor/product/search', [authJwt.isVendor], auth.searchProducts);
    app.get("/api/vendor/product/all/paginateProductSearch", [authJwt.isVendor], auth.paginateProductSearch);
    app.get('/api/vendor/coupon', [authJwt.isVendor], auth.getAllCoupons);
    app.get('/api/vendor/forAdminCoupon', /*[authJwt.isVendor],*/ auth.getAllCouponsForAdmin);
    app.get('/api/vendor/coupon/:couponId', [authJwt.isVendor], auth.getCouponById);
    app.get('/api/vendor/coupons/active', [authJwt.isVendor], auth.getActiveCoupons);
    app.get('/api/vendor/order', [authJwt.isVendor], auth.getAllOrders);
    app.get('/api/vendor/order/:orderId', [authJwt.isVendor], auth.getOrderById);
    app.put('/api/vendor/order/:id/status', [authJwt.isVendor], auth.updateOrderStatus);
    app.get('/api/vendor/payment', [authJwt.isVendor], auth.getPayments);
    app.get('/api/vendor/payment/:paymentId', [authJwt.isVendor], auth.getPaymentDetails);
    app.put('/api/vendor/payment/:paymentId', [authJwt.isVendor], auth.updatePaymentStatus);
    app.delete('/api/vendor/payment/:paymentId', [authJwt.isVendor], auth.deletePayment);
    app.get('/api/vendor/count/:vendorId', [authJwt.isVendor], auth.getCounts);



}