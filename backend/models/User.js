const { default: mongoose } = require("mongoose");

// skills - id false so that it isn't replicated in the parent aka user
const skillSchema = new mongoose.Schema({
    name: {type: String, required: true, lowercase: true, trim: true},
    level: {type: Number, min:1, max: 5, default: 3},
}, {_id: false});

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, minLength: 3},
    email: {type: String, required: true, unique: true, match: /.+@.+\..+/},
    password: {type: String, required: true, select: false},
    skill: [skillSchema],
    prefferredRoles: [String],
    technologies: [String],
    interests: [String], 
    weekHoursAvailable: {type: Number, min: 0, max: 40, default: 10},
    experience: {type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner'},
    bio: {type: String, maxlength: 300},
}, {timestamps: true});
