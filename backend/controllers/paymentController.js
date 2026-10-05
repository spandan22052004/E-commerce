const Razorpay = require('razorpay');
const crypto = require('crypto');
dotenv = require('dotenv').config();


const createYourOrder = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: req.body.totalAmount * 100,
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString('hex')
        };
        const order = await instance.orders.create(options);

        res.status(200).json({
            ...order,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Create the string that Razorpay expects
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        // Generate HMAC SHA256 signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Compare signatures
        if (expectedSignature === razorpay_signature) {
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        }

        return res.status(400).json({
            success: false,
            message: "Payment verification failed"
        });

    } catch (error) {
        console.error("Payment verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createYourOrder,
    verifyPayment
}