const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});

app.post('/api/issueBadge', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Missing name or email' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or use another SMTP provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Open Badge Issuer" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🎖️ Your Open Badge is Here!',
            text: `Hi ${name},\n\nCongratulations on earning your badge!\n\nAttached is your badge.`,
            attachments: [
                {
                    filename: 'badge.png',
                    path: './badges/sample-badge.png', // Make sure you have a badge file or link
                },
            ],
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Email sending failed', error);
        res.status(500).json({ error: 'Failed to send badge' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
