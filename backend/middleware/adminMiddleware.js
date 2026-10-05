

const admin = async(req,res,next)=>{
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
         res.status(401).json({ message: "Access Denied, admin only" });
    }
};

module.exports = {admin};