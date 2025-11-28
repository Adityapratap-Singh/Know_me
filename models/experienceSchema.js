const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    company: { 
        type: String, 
        required: true
    },
    location: { 
        type: String, 
        default: "" 
    },
    employmentType: { 
        type: String, 
        default: "" 
    }, // Full-time, internship, etc.
    startDate: { 
        type: Date },
    endDate: { 
        type: Date, 
        default: null 
    },
    description: { 
        type: String, 
        default: "" 
    },
    linkedinUrl: { 
        type: String, 
        default: "" 
    },
    autoSynced: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Experience", ExperienceSchema);
