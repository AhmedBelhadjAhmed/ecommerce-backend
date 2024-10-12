const bcrypt = require('bcryptjs');  // Change to bcryptjs
const User = require('../models/userModel');
const { deleteAvatar } = require('../middlewares/uploadSingleImage');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transport = require('../config/nodemailer');

//register user 
const register = async (req, res) => {
    let filePath = null;

    try {
        const { firstname, lastname, email, password, role } = req.body;

        // Password validation
        if (!password || password.length === 0) {
            if (req.file) await deleteAvatar(req.file.filename);
            return res.status(400).send({ error: "Password is required" });
        }

        if (password.length < 6) {  
            if (req.file) await deleteAvatar(req.file.filename);
            return res.status(400).send({ error: "Password must be at least 6 characters long" });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (req.file) await deleteAvatar(req.file.filename);
            return res.status(400).send({ error: "Email already in use" });
        }

        // Prepare user object
        const user = new User({
            firstname,
            lastname,
            email,
            password: '',  // Will hash the password before saving
            role,
            avatar: ''
        });

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;

        // Handle avatar file path if an image is uploaded
        if (req.file) {
            filePath = req.file.path;  // The path provided by Cloudinary
            user.avatar = filePath;
        }

        // Save the new user to the database using Mongoose
        const userResponse = await user.save();

        res.status(200).send(userResponse);

    } catch (error) {
        console.error(error);

        // Delete the uploaded avatar from Cloudinary if there's an error
        if (req.file) {
            await deleteAvatar(req.file.filename);
        }

        res.status(400).send({ error: error.message });
    }
};

//login 
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email using Mongoose
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ error: "Invalid email or password" });

        // Compare the provided password with the hashed password in the database
        const verifyPassword = await bcrypt.compare(password, user.password);
        if (!verifyPassword) return res.status(400).send({ error: "Invalid email or password" });

        // Generate a JWT token with the user's id (use _id in Mongoose)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

        // Send the token to the client
        res.status(200).send({ token: token });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

//check if password valid or not
const checkPassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email using Mongoose
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        return res.status(200).json({ success: true, message: "Password is correct" });
    } catch (error) {
        console.error("Error checking password:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// forget password and send email
const forgetPass = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email using Mongoose
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: "User not found!" });
        }

        // Generate a reset token and set expiration time (5 minutes)
        const resetToken = crypto.randomBytes(20).toString('hex');
        const expireIn = Date.now() + 5 * 60 * 1000; // 5 minutes from now

        // Update the user with the reset token and expiration time
        user.resetToken = resetToken;
        user.expireIn = expireIn;

        // Save the updated user in the database
        await user.save();

        // Set up the email options
        const mailOptions = {
            to: email,
            from: process.env.GMAIL_USER, // Your Gmail user from .env file
            subject: "Reset Password",
            text: `Token: ${resetToken} will expire in 5 minutes.`
        };

        // Send the reset password email
        await transport.sendMail(mailOptions);

        res.status(200).send({ message: 'Password reset email sent' });

    } catch (error) {
        console.log(error.message);
        res.status(400).send({ error: error.message });
    }
};

// reset password
const resetPass = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Find the user by resetToken using Mongoose
        const user = await User.findOne({ resetToken });
        if (!user) {
            return res.status(404).send({ error: "Invalid token!" });
        }

        // Check if the token has expired
        if (Date.now() > user.expireIn) {
            return res.status(400).send({ error: "Token expired" });
        }

        // Check if the new password meets the length requirement
        if (newPassword.length < 6) {
            return res.status(400).send({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the new password using bcrypt
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        user.password = hash;

        // Clear the reset token and expiration time
        user.resetToken = '';
        user.expireIn = null;

        // Save the updated user data
        await user.save();

        res.status(200).send({ message: 'Password reset successful' });

    } catch (error) {
        console.log(error.message);
        res.status(400).send({ error: error.message });
    }
};


module.exports = {
    register,
    login,
    forgetPass,
    resetPass,
    checkPassword
};
