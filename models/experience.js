const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const experienceSchema = new Schema({
    company: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        validate: {
            validator: function(value) {
                // If endDate is provided, it must be greater than or equal to startDate
                return !value || this.startDate <= value;
            },
            message: 'End date must be after start date.'
        }
    },
    responsibilities: {
        type: [String],
        required: true,
        validate: {
            validator: function(value) {
                return value.length > 0;
            },
            message: 'At least one responsibility is required.'
        }
    }
});

module.exports = mongoose.model('Experience', experienceSchema);