const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Badge issuing route
app.post('/api/issueBadge', async (req, res) => {
    const { name, email } = req.body;
    console.log(`Received badge claim for ${name} <${email}>`);
    // implement email sending or badge logic here
    res.status(200).send({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));