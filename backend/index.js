const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
connectDB();

app.get("/",(req,res)=>{
    res.send("Server is running fine");
})

app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/products',require('./routes/productRoutes'));
app.use('/api/orders',require('./routes/orderRoutes'));
app.use('/api/payments',require('./routes/paymentRoutes'));
app.use('/api/analytics',require('./routes/analyticsRoutes'));



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is listening to ${PORT}`);
})