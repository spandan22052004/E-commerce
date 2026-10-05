
import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
    const { user } = useContext(AuthContext);
    const cartItems = useSelector((state) => state.cart.cartItems);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        postalCode: '',
        country: ''
    });

    const [loading, setLoading] = useState(false);

    // Calculate the total price of all cart items
    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );

    // Handle payment
    const handlePayment = async () => {
        if (!user) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }

        if (!window.Razorpay) {
            alert(
                'Razorpay Checkout is not loaded. Please check the Razorpay script in public/index.html.'
            );
            return;
        }

        setLoading(true);

        try {
            // STEP 1: Create Razorpay order on the backend
            const orderRes = await fetch('/api/payments/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    totalAmount: totalPrice
                })
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                throw new Error(
                    orderData.message || 'Failed to create Razorpay order'
                );
            }

            // STEP 2: Configure Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'ShopNest',
                description: 'Test Transaction',
                order_id: orderData.id,

                // STEP 3: Handle successful payment
                handler: async function (response) {
                    try {
                        // STEP 4: Verify payment on the backend
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(response)
                        });

                        const verifyData = await verifyRes.json();

                        if (!verifyRes.ok || !verifyData.success) {
                            alert(
                                verifyData.message ||
                                'Payment verification failed'
                            );
                            return;
                        }

                        // STEP 5: Convert cart items to the Order schema format
                        const orderItems = cartItems.map((item) => ({
                            product: item.productId,
                            quantity: item.qty
                        }));

                        // STEP 6: Save the order in MongoDB
                        const saveOrderRes = await fetch('/api/orders', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${user.token}`
                            },
                            body: JSON.stringify({
                                items: orderItems,
                                totalAmount: totalPrice,
                                address,
                                paymentId: response.razorpay_payment_id
                            })
                        });

                        const saveOrderData = await saveOrderRes.json();

                        if (saveOrderRes.ok) {
                            dispatch(clearCart());
                            navigate('/ordersuccess');
                        } else {
                            alert(
                                saveOrderData.message ||
                                'Payment succeeded, but saving the order failed.'
                            );
                        }
                    } catch (error) {
                        console.error('Payment processing error:', error);
                        alert(error.message || 'Error processing payment');
                    } finally {
                        setLoading(false);
                    }
                },

                // STEP 7: Prefill customer details
                prefill: {
                    name: address.fullName,
                    email: user?.email,
                    contact: '9999999999'
                },

                theme: {
                    color: '#f97316'
                },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            // STEP 8: Open Razorpay Checkout
            const razorpay = new window.Razorpay(options);

            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                alert(
                    response.error.description ||
                    'Payment failed. Please try again.'
                );
                setLoading(false);
            });

            razorpay.open();

        } catch (error) {
            console.error('Payment initialization error:', error);
            alert(error.message || 'Unable to initialize payment');
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!user) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        handlePayment();
    };

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>

            <div className="checkout-content">
                <form
                    onSubmit={handleSubmit}
                    className="shipping-form"
                >
                    <h3>Shipping Address</h3>

                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={address.fullName}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                fullName: e.target.value
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Street"
                        required
                        value={address.street}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                street: e.target.value
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="City"
                        required
                        value={address.city}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                city: e.target.value
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Postal Code"
                        required
                        value={address.postalCode}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                postalCode: e.target.value
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Country"
                        required
                        value={address.country}
                        onChange={(e) =>
                            setAddress({
                                ...address,
                                country: e.target.value
                            })
                        }
                    />

                    <div className="checkout-summary">
                        <h4>
                            Total to Pay: ₹{totalPrice.toFixed(2)}
                        </h4>

                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;