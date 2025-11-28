const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    linkedinUrl: {
        type: String,  // If project is from LinkedIn
        default: ""
    },
    githubUrl: {
        type: String,
        default: ""
    },
    liveUrl: {
        type: String,
        default: ""
    },
    image: {
        type: String,  // Thumbnail or project banner
        default: ""
    },
    techStack: {
        type: [String],  // ["React", "Node", "MongoDB"]
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Project", ProjectSchema);
