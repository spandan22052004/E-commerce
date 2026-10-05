const express = require('express');
const{createYourOrder,verifyPayment} = require("../controllers/paymentController");
const router = express.Router();

router.post('/order',createYourOrder);
router.post('/verify',verifyPayment);

module.exports = router;