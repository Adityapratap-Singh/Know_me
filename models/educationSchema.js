const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
    school:{ 
        type: String, 
        required: true 
    },
    degree:{
        type: String,
        required: true 
    },
    fieldOfStudy:{
        type: String, 
        default: ""
    },
    startDate:{
        type: Date
    },
    endDate:{
        type: Date,
        default: null 
    },
    grade: {
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

module.exports = mongoose.model("Education", EducationSchema);
