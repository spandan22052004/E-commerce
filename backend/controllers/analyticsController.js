const Order = require("../model/Order");
const Product = require("../model/Product");
const User = require("../model/User")

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalOrders = await Order.countDocuments({});
        const totalProducts = await Product.countDocuments({});

        const orders = await Order.find({});
        const totalRevenueData = orders.reduce((acc,order)=>acc+order.totalAmount,0);

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue:totalRevenueData
        });
    } catch (error) {
        res.status(500).json({message})
    }
}

module.exports={
    getAdminStats
};