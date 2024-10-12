const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'Gmail', // or another email service
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

module.exports = transport;
