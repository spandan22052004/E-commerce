const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        otpHash: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('EmailOTP', emailOTPSchema);