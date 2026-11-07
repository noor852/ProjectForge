
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// skills - id false so that it isn't replicated in the parent aka user
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true, trim: true },
  level: { type: Number, min: 1, max: 5, default: 3 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, match: /.+@.+\..+/ },
  password: { type: String, required: true, minLength: 6, select: false },
  skills: [skillSchema],
  preferredRoles: [{ type: String, lowercase: true, trim: true }],
  technologies: [{ type: String, lowercase: true, trim: true }],
  interests: [{ type: String, lowercase: true, trim: true }],
  availability: { type: Number, min: 0, max: 40, default: 10 },
  experience: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  bio: { type: String, maxlength: 300, default: "" },
}, { timestamps: true });

userSchema.pre("save", async function() {
    if(!this.isModified("password")) 
    {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
    return bcrypt.compare(plain, this.password);
}

module.exports = mongoose.model("User", userSchema)