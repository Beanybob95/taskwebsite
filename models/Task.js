
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title: String,
    description: String,
    status: {
        type: String,
        enum: ['incomplete', 'completed'],
        default: 'incomplete'
    },
    dueDate: Date
});

module.exports = mongoose.model('Task', TaskSchema);