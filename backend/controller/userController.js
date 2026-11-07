const User = require("../models/User");

exports.getMe = function (req, res) {
  res.json({ user: req.user });
};

exports.getUser = async function (req, res) {
  try {
    const user = await User.findById(req.params.id).select("-email");
    if (!user) {
      return res.status(404).json({ message: "Student not found!" });
    }
    res.json({ user: user });
  } catch (err) {
    res.status(400).json({ message: "Student not found!" });
  }
};

exports.updateMe = async function (req, res) {
  try {
    const { name, bio, experience, availability, preferredRoles, technologies, interests, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name,
        bio: bio,
        experience: experience,
        availability: availability,
        preferredRoles: preferredRoles,
        technologies: technologies,
        interests: interests,
        skills: skills
      },
      { new: true, runValidators: true }
    );

    res.json({ user: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};