const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const educationSchema = new Schema({
    university: {
        type: String, 
        required: true,
        trim: true
    },
    institution: {
        type: String, 
        required: true,
        trim: true
    },
    degree:{
        type: String,
        required: true,
        trim: true
    },
    fieldOfStudy:{
        type: String,
        trim: true,
        validate: {
            validator: function(value) {
                // If degree is not 'SSC', fieldOfStudy is required
                if (this.degree !== 'SSC' && (!value || value.trim() === '')) {
                    return false;
                }
                return true;
            },
            message: 'Field of study is required.'
        }
    },
    startDate:{
        type: Date,
        required: true
    },
    endDate:{
        type: Date,
        validate: {
            validator: function(value) {
                // If endDate is provided, it must be greater than or equal to startDate
                return !value || this.startDate <= value;
            },
            message: 'End date must be after start date.'
        }
    },
    grade: { 
        type: String,
        trim: true
    },
    description: { 
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('education', educationSchema);