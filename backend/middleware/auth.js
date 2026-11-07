const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1]: null;
    if (!token)
    {
        return res.status(401).json({message: "user not authenticated!"});
    }
    try 
    {
        const {id} = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);
        if (!user)
        {
            return res.status(401).json({message: "user does not exist!"});
        }
        req.user = user;
        next();
    }
    catch
    {
        res.status(401).json({message: "invalid/expired token!"});
    }
};