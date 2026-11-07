const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sign = (id) => jwt.sign(
    {id}, 
    process.env.JWT_SECRET, 
    {expiresIn: "7d"});

exports.register = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        if (await User.findOne({email}))
        {
            return res.status(400).json({message: "This email already exists!"});
        }
        const user = await User.create({name, email, password})
        res.status(201).json({
            token: sign(user._id),
            user: {_id: user._id, name: user.name, email: user.email},
        });

    }
    catch(err)
    {
        res.status(400).json({message: err.message});
    }
};

exports.login = async (req, res) => {
    try
    {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select("+password");
        if (!user || !(await user.matchPassword(password)))
        {
            return res.status(400).json({message: "Invalid email or password entered!"});
        }
        res.json({
            token: sign(user._id),
            user: {_id: user._id, name: user.name, email: user.email}
        })

    }
    catch(err)
    {
        res.status(400).json({message: err.message});
    }
};

exports.me = (req, res) => {
    res.json({user: req.user});
};