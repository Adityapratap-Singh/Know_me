const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    endorsements: { 
        type: Number, 
        default: 0 
    }, // from LinkedIn
    linkedinUrl: {
        type: String,
        default: ""
    },
    autoSynced: {
        type: Boolean, 
        default: true 
    }
});

module.exports = mongoose.model("Skill", SkillSchema);
