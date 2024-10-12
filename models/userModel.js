const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: [true, 'firstname is required'],
        trim: true  // Automatically trims whitespace
    },
    lastname: {
        type: String,
        required: [true, 'lastname is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,  // Ensure email is unique
        trim: true,
        validate: {
            validator: function(value) {
                // Basic email regex validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'email is not valid'
        }
    },
    password: {
        type: String,
        required: [true, 'password must be at least 6 characters long'],
        minlength: [6, 'password must be at least 6 characters long']
    },
    role: {
        type: String,
        required: [true, 'role is required'],
        trim: true
    },
    avatar: {
        type: String,  // URL to the avatar image
        default: null  // If not provided, will be null
    },
    resetToken: {
        type: String,
        default: null  // Token for password reset, can be null
    },
    expireIn: {
        type: String,
        default: null  // Token expiration time, can be null
    }
}, {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
    collection: 'users'  // Specify the collection name in MongoDB
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
