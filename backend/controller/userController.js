const User = require("../models/User");

const clean = (arr) => Array.isArray(arr) ? [...new Set(arr.map((x) => String(x).trim().toLowerCase()).filter(Boolean))]: [];

exports.getMe = (req, res) => res.json({user: req.user});

exports.getUser = async(req, res) => {
    try{
        const user = await User.findByIf(req.params.id).select("-email");
        if (!user)
        {
            return res.status(404).json({message: "student not found!"});
        }
        res.json({user});
    }
    catch{
        res.status(400).json({message: "student not found!"});
    }
};

exports.updateMe = async(req, res) => {
    try{
        const b = req.body;
        const update = {};

        if (b.name !== undefined)
        {
            update.name = b.name;
        }
        if (b.bio !== undefined)
        {
            update.bio = b.bio;
        }
        if (b.experience !== undefined)
        {
            update.experience = b.experience;
        }
        if (b.availability !== undefined)
        {
            update.availability = b.availability;
        }
        if (b.preferredRoles)
        {
            update.preferredRoles = clean(b.preferredRoles);
        }
        if (b.technologies)
        {
            update.technologies = clean(b.technologies);
        }
        if (b.interests)
        {
            update.interests = clean(b.interests);
        }
        if (b.skills)
        {
            const seen = new Map();
            b.skills.forEach((s) => {
                const name = String(s.name || "").trim().toLowerCase();
                if (name)
                {
                    seen.set(name, {name, level: Number(s.level) || 3});
                }
                
            });
            update.skills = [...seen.values()];
        }

        const user = await User.findByIdAndUpdate(req.user._id, update, {
            new: true,
            runValidators: true
        });
        res.json({user});
    }
    catch(err)
    {
        res.status(400).json({message:err.message});
    }
};

