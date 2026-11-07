const { default: mongoose } = require("mongoose");

const projectSkills = new mongoose.Schema({
        name: {type: String, lowercase: true, trim: true},
        importance: {type: String, enum: ['essential', 'secondary'], default: 'essential'},
        minLevel: {type: Number, min: 1, max: 5, default: 1},
        _id: false
    });

const projectMembers = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    role: String,
    _id: false
})

const projectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    domain: String,
    teamSize: {type: Number, default: 4},
    technologies: [String],
    requiredSkills: [projectSkills],
    status: {type: String, enum: ['draft', 'looking', 'forming', 'complete', 'in_progress'], default: 'looking'},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    members: [projectMembers]
}, {timestamps: true});