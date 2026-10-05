const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const EmailOTP = require('../model/EmailOTP');
const sendEmail = require('../utils/sendEmail');
// Implementing JWT auth
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

//Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide name, email and password'
            });
        }

        // Check whether the email has already been registered
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // Check whether the email OTP was verified
        const otpRecord = await EmailOTP.findOne({
            email,
            verified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: 'Please verify your email before registering'
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the verified user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verified: true
        });

        // Delete the OTP record after successful registration
        await EmailOTP.deleteOne({ email });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Registration error:', error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({
                message: 'Invalid Email or Password'
            });
        }

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            message: 'Server Error'
        });
    }
};

const getUser = async(req,res)=>{
    try{
        const users = await User.find({}).select('-password');
        res.json(users);
    }catch(err){
        res.status(500).json({ message: "Server Error" });
    }
};




const sendOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        await EmailOTP.findOneAndUpdate(
            { email },
            {
                email,
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                verified: false
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendEmail(
            email,
            'ShopNest Email Verification OTP',
             `
    <div style="
        background-color: #09090b;
        padding: 40px 20px;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 500px;
            margin: auto;
            background-color: #18181b;
            border-radius: 16px;
            padding: 35px;
            text-align: center;
            border: 1px solid #27272a;
        ">

            <h1 style="
                color: #f97316;
                margin-bottom: 10px;
            ">
                ShopNest
            </h1>

            <h2 style="
                color: white;
                margin-bottom: 10px;
            ">
                Email Verification
            </h2>

            <p style="
                color: #a1a1aa;
                font-size: 15px;
            ">
                Use the OTP below to verify your email address.
            </p>

            <div style="
                margin: 30px auto;
                padding: 20px;
                background-color: #09090b;
                border: 1px solid #f97316;
                border-radius: 10px;
                width: 180px;
            ">

                <span style="
                    color: #f97316;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 6px;
                ">
                    ${otp}
                </span>

            </div>

            <p style="
                color: #a1a1aa;
                font-size: 13px;
            ">
                This OTP is valid for 10 minutes.
            </p>

            <p style="
                color: #71717a;
                font-size: 12px;
                margin-top: 30px;
            ">
                If you did not request this OTP, you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #27272a;
                margin: 25px 0;
            ">

            <p style="
                color: #52525b;
                font-size: 11px;
            ">
                © ${new Date().getFullYear()} ShopNest. All rights reserved.
            </p>

        </div>

    </div>
    `
        );

        res.status(200).json({
            message: 'OTP sent to your email'
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            message: 'Failed to send OTP'
        });
    }
};



const verifyOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const otpRecord = await EmailOTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                message: 'OTP not found. Please request a new OTP.'
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await EmailOTP.deleteOne({ email });

            return res.status(400).json({
                message: 'OTP expired. Please request a new OTP.'
            });
        }

        const isMatch = await bcrypt.compare(
            String(otp),
            otpRecord.otpHash
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid OTP'
            });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            message: 'OTP verification failed'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUser,
    verifyOTP,
    sendOTP
}