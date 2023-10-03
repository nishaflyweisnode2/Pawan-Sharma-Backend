const Product = require('../models/productmodel');
const SubCategory = require('../models/subCategoryModel');
const Category = require('../models/categoryModel');


const { productSchema, productIdSchema, updateProductSchema } = require('../validations/productvalidation');




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
        const categories = await Category.findById(category)
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
