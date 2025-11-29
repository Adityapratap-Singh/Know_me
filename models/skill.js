const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const skillSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    tools: {
        type: [String],
        required: true,
        validate: {
            validator: function(value) {
                return value.length > 0;
            },
            message: 'At least one tool is required.'
        }
    }
});

module.exports = mongoose.model('Skill', skillSchema);