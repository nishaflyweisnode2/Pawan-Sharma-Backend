const express = require('express');
const router = express.Router();

const auth = require('../controllers/productController');



const authJwt = require("../middleware/auth");

const { productImage } = require('../middleware/imageUpload');



module.exports = (app) => {

    // api/user/

    app.post('/api/user/products', [authJwt.verifyToken], productImage.array('image'), auth.createProduct);
    app.get('/api/user/products', [authJwt.verifyToken], auth.getAllProducts);
    app.get('/api/user/products/:productId', [authJwt.verifyToken], auth.getProductById);
    app.put('/api/user/products/:productId', [authJwt.verifyToken], productImage.array('image'), auth.updateProduct);
    app.delete('/api/user/products/:productId', [authJwt.verifyToken], auth.deleteProduct);


}