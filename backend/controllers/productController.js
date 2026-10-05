const Product = require('../model/Product');
const cloudinary = require('../config/cloudinary');


const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (product) {
            res.json(product);
        } else {
            res.status(400).json({ message: 'Product not found' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
}

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock
        } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category || stock === undefined) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate price and stock
        if (price < 0 || stock < 0) {
            return res.status(400).json({
                message: "Price and stock cannot be negative"
            });
        }

        let imageUrl = "";

        // Upload image to Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        // Create product
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl
        });

        // Save product
        const savedProduct = await product.save();

        return res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            category,
            stock
        } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }
        // Validate price
        if (price !== undefined && price < 0) {
            return res.status(400).json({
                message: "Price cannot be negative"
            });
        }

        // Validate stock
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative"
            });
        }

        if (name !== undefined) {
            product.name = name;
        }
        if (description !== undefined) {
            product.description = description;
        }
        if (price !== undefined) {
            product.price = price;
        }
        if (category !== undefined) {
            product.category = category;
        }
        if (stock !== undefined) {
            product.stock = stock;
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            product.imageUrl = result.secure_url;
        }
        const updatedProduct = await product.save();
        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (err) {
        console.error("Update product error:", err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


const deleteProduct = async(req,res)=>{
    try{
        const{id} = req.params;
        const product = await Product.findById(id);

        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        await product.deleteOne();
        res.status(200).json({message:"Product deleted successfully"});
    }catch(err){
        res.status(500).json({message:'Server error'});
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}