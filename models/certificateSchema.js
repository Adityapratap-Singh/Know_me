const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    issuer:{
        type: String,
        required: true
    },     // e.g., LinkedIn, Google, Coursera
    issueDate:{
        type: Date 
    },
    expiryDate:{
        type: Date,
        default: null 
    },
    credentialId:{ 
        type: String, 
        default: "" 
    },
    credentialUrl: {
        type: String, 
        default: "" 
    },
    linkedinUrl: { 
        type: String, 
        default: "", 
    },   // Certificate post or link
    autoSynced:{
        type: Boolean, 
        default: true }, // Was it auto-imported?
    createdAt:{ 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Certificate", CertificateSchema);
