const auth = require("../controllers/adminController");
const express = require("express");
const router = express()


const authJwt = require("../middleware/auth");


const { profileImage, categoryImage, subCategoryImage, productImage, couponImage, offerImage } = require('../middleware/imageUpload');




module.exports = (app) => {

    // api/user/

    app.post('/api/admin/register', auth.register);
    app.post('/api/admin/login', auth.login)
    app.get('/api/admin/users', [authJwt.isAdmin], auth.getAllUsers);
    app.get('/api/admin/users/:userId', [authJwt.isAdmin], auth.getUserById)
    app.delete('/api/admin/users/:userId', [authJwt.isAdmin], auth.deleteUser);
    app.post('/api/admin/categories', [authJwt.isAdmin], categoryImage.single('image'), auth.createCategory);
    app.get('/api/admin/categories', [authJwt.isAdmin], auth.getAllCategories);
    app.get('/api/admin/categories/:categoryId', [authJwt.isAdmin], auth.getCategoryById);
    app.put('/api/admin/categories/:categoryId', [authJwt.isAdmin], categoryImage.single('image'), auth.updateCategory);
    app.delete('/api/admin/categories/:categoryId', [authJwt.isAdmin], auth.deleteCategory);
    app.post('/api/admin/subcategories', [authJwt.isAdmin], subCategoryImage.single('image'), auth.createSubCategory);
    app.get('/api/admin/subcategories', [authJwt.isAdmin], auth.getAllSubCategories);
    app.get('/api/admin/subcategories/:subcategoryId', [authJwt.isAdmin], auth.getSubCategoryById);
    app.put('/api/admin/subcategories/:subcategoryId', [authJwt.isAdmin], subCategoryImage.single('image'), auth.updateSubCategory);
    app.delete('/api/admin/subcategories/:subcategoryId', [authJwt.isAdmin], auth.deleteSubCategory);
    app.post('/api/admin/products', [authJwt.isAdmin], productImage.array('image'), auth.createProduct);
    app.get('/api/admin/products', [authJwt.isAdmin], auth.getAllProducts);
    app.get('/api/admin/productsByAdmin', /*[authJwt.isAdmin],*/ auth.getAllProductsByAdmin);
    app.get('/api/admin/products/:productId', [authJwt.isAdmin], auth.getProductById);
    app.get('/api/admin/forAdminProducts/:productId', /*[authJwt.isAdmin],*/ auth.forAdminGetProductById);
    app.put('/api/admin/products/:productId', [authJwt.isAdmin], productImage.array('image'), auth.updateProduct);
    app.delete('/api/admin/products/:productId', [authJwt.isAdmin], auth.deleteProduct);
    app.post('/api/admin/products/:productId/reviews', [authJwt.isAdmin], auth.createProductReview);
    app.get('/api/admin/products/:productId/reviews', [authJwt.isAdmin], auth.getAllProductReviews);
    app.get('/api/admin/products/:productId/reviews/:reviewId', [authJwt.isAdmin], auth.getProductReviewById);
    app.put('/api/admin/products/:productId/reviews/:reviewId', [authJwt.isAdmin], auth.updateProductReview);
    app.delete('/api/admin/products/:productId/reviews/:reviewId', [authJwt.isAdmin], auth.deleteProductReview);
    app.get('/api/admin/products/category/:categoryId', [authJwt.isAdmin], auth.getProductsByCategory);
    app.get('/api/admin/products/subCategoryId/:subCategoryId', [authJwt.isAdmin], auth.getProductsBySubCategory);
    app.get('/api/admin/product/search', [authJwt.isAdmin], auth.searchProducts);
    app.get("/api/admin/product/all/paginateProductSearch", [authJwt.isAdmin], auth.paginateProductSearch);
    app.post('/api/admin/coupon', [authJwt.isAdmin], couponImage.single('image'), auth.createCoupon);
    app.get('/api/admin/coupon', [authJwt.isAdmin], auth.getAllCoupons);
    app.get('/api/admin/forAdminCoupon', /*[authJwt.isAdmin],*/ auth.getAllCouponsForAdmin);
    app.get('/api/admin/coupon/:couponId', [authJwt.isAdmin], auth.getCouponById);
    app.put('/api/admin/coupon/:couponId', [authJwt.isAdmin], couponImage.single('image'), auth.updateCoupon);
    app.get('/api/admin/coupons/active', [authJwt.isAdmin], auth.getActiveCoupons);
    app.delete('/api/admin/coupon/:couponId', [authJwt.isAdmin], auth.deleteCoupon);
    app.post('/api/admin/offers', [authJwt.isAdmin], offerImage.single('image'), auth.createOffer);
    app.get('/api/admin/offers', [authJwt.isAdmin], auth.getAllOffers);
    app.get('/api/admin/forAdminOffers', /*[authJwt.isAdmin],*/ auth.getAllOffersForAdmin);
    app.get('/api/admin/offers/:offerId', [authJwt.isAdmin], auth.getOfferById);
    app.put('/api/admin/offers/:offerId', [authJwt.isAdmin], offerImage.single('image'), auth.updateOffer);
    app.delete('/api/admin/offers/:offerId', [authJwt.isAdmin], auth.deleteOffer);
    app.post('/api/admin/notifications', [authJwt.isAdmin], auth.createNotification);
    app.get('/api/admin/notifications/user/:userId', [authJwt.isAdmin], auth.getNotificationsForUser);
    app.get('/api/admin/order', [authJwt.isAdmin], auth.getAllOrders);
    app.get('/api/admin/order/:orderId', [authJwt.isAdmin], auth.getOrderById);
    app.put('/api/admin/order/:id/status', [authJwt.isAdmin], auth.updateOrderStatus);
    app.get('/api/admin/payment', [authJwt.isAdmin], auth.getPayments);
    app.get('/api/admin/payment/:paymentId', [authJwt.isAdmin], auth.getPaymentDetails);
    app.put('/api/admin/payment/:paymentId', [authJwt.isAdmin], auth.updatePaymentStatus);
    app.delete('/api/admin/payment/:paymentId', [authJwt.isAdmin], auth.deletePayment);
    app.put('/api/admin/referral/:referralId', [authJwt.isAdmin], auth.updateReferralStatus);
    app.get('/api/admin/referrals', [authJwt.isAdmin], auth.getAllReferrals);
    app.get('/api/admin/referrals/:referralId', [authJwt.isAdmin], auth.getReferralById);
    app.delete('/api/admin/referrals/:referralId', [authJwt.isAdmin], auth.deleteReferral);
    app.post('/api/admin/:userId/wallet', [authJwt.isAdmin], auth.createUserWallet);
    app.put('/api/admin/:userId/wallet', [authJwt.isAdmin], auth.updateWalletBalance);
    app.get('/api/admin/:userId/wallet', [authJwt.isAdmin], auth.getWalletBalance);
    app.get('/api/admin/getAllBalances', [authJwt.isAdmin], auth.getAllUserWalletBalances);
    app.delete('/api/admin/:userId/wallet', [authJwt.isAdmin], auth.deleteWallet);

}