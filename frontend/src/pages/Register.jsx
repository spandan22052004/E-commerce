import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Controls whether password is visible
    const [showPassword, setShowPassword] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        // If email changes, verification is required again
        if (name === 'email') {
            setEmailVerified(false);
            setOtpSent(false);
            setOtp('');
            setMessage('');
        }
    };

    // Send OTP
    const handleSendOTP = async () => {
        if (!formData.email.trim()) {
            setMessage('Please enter your email address.');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setOtpSent(true);
            setMessage(data.message || 'OTP sent to your email.');

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        if (!otp.trim()) {
            setMessage('Please enter the OTP.');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            setEmailVerified(true);
            setMessage(data.message || 'Email verified successfully!');

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Register
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailVerified) {
            setMessage('Please verify your email before registering.');
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            login(data);
            navigate('/');

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <form onSubmit={handleSubmit} className="auth-form">

                <h2>Create Your ShopNest Account</h2>

                {/* Name */}
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                {/* Email */}
                <div className="input-group">

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="button"
                        className="btn otp-btn"
                        onClick={handleSendOTP}
                        disabled={loading || emailVerified}
                    >
                        {emailVerified
                            ? 'Verified'
                            : loading && !otpSent
                            ? 'Sending...'
                            : 'Send OTP'}
                    </button>

                </div>

                {/* OTP */}
                {otpSent && !emailVerified && (
                    <div className="input-group">

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            inputMode="numeric"
                            required
                        />

                        <button
                            type="button"
                            className="btn otp-btn"
                            onClick={handleVerifyOTP}
                            disabled={loading}
                        >
                            {loading
                                ? 'Please wait...'
                                : 'Verify OTP'}
                        </button>

                    </div>
                )}

                {/* Verification message */}
                {emailVerified && (
                    <p className="success-message">
                        ✓ Email verified successfully
                    </p>
                )}

                {/* Password */}
                <div className="password-group">

                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                    />

                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                            showPassword
                                ? 'Hide password'
                                : 'Show password'
                        }
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>

                </div>

                {/* Status message */}
                {message && !emailVerified && (
                    <p className="status-message">
                        {message}
                    </p>
                )}

                {/* Register button */}
                <button
                    type="submit"
                    className="btn"
                    disabled={loading || !emailVerified}
                >
                    {loading
                        ? 'Please wait...'
                        : 'Register'}
                </button>

                {/* Login link */}
                <p>
                    Already have an account?{' '}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </form>

        </div>
    );
};

export default Register;