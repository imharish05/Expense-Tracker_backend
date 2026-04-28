const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    phone: { 
        type: String, 
        required: [true, 'Please add a phone number'], 
        unique: true 
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true 
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'] 
    },
    role: { 
        type: String, 
        default: 'admin' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);