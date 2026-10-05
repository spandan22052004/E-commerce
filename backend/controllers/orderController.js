const Order = require("../model/Order");
const sendEmail = require("../utils/sendEmail");



const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').populate('items.product', 'name price');
        res.status(200).json(orders);

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const myOrders = await Order.find({ user: req.user._id }).populate('items.product', 'name price');

        res.json(myOrders);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, paymentId } = req.body;
        if (!items || items.length === 0 || !totalAmount || !address) {
            return res.status(400).json({ message: "Invalid Order Data" });
        }
        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId
        });
        await order.save();
        const message = `Your order Created Successfully`;
        await sendEmail(req.user.email, 'Order Created Successfully', message);

        res.status(201).json({ message: "Order Created Successfully", order });

    } catch (err) {
        console.error("This is the error : ", err);
        res.status(500).json({ message: "Server error" });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = status;
            await order.save();
            res.json({ message: "Order status updated", order });
        } else {
            res.status(404).json({ message: "Order not found" });
        }

    } catch (error) {
        console.error("Update Order Status Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    getOrderById,
    getOrders,
    createOrder,
    updateOrderStatus
}