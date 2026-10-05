const mongoose = require('mongoose');


const connectDB = async()=>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Sucessfully");

    }catch(err){
      console.error("MongoDB Connection Failed :",err.message);
      process.exit(1);
    }
};

module.exports = connectDB;