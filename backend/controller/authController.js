const jwt = require("jsonwebtoken");
const User = require("../models/User");

function sign(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.register = async function (req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(400).json({ message: "This email already exists!" });
    }

    const user = await User.create({ name: name, email: email, password: password });

    res.status(201).json({
      token: sign(user._id),
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password entered!" });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password entered!" });
    }

    res.json({
      token: sign(user._id),
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.me = function (req, res) {
  res.json({ user: req.user });
};