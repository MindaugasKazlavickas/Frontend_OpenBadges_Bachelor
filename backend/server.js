const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    badge_id: BADGE_ID
} = process.env;

const TOKEN_URL = "https://openbadgefactory.com/v2/client/oauth2/token";
const ISSUE_URL = "https://openbadgefactory.com/v2/client/badge/assertion/add";

// Request access token using client credentials
async function getAccessToken() {
    try {
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const text = await response.text();
        console.log("Access token response:", text);

        if (!response.ok) throw new Error(`Failed to get access token (${response.status})`);

        const data = JSON.parse(text);
        return data.access_token;
    } catch (err) {
        console.error("Access token error:", err.message);
        throw err;
    }
}


// Route to issue badge
app.post("/issue-obf-badge", async (req, res) => {
    const { email, firstName = "", lastName = "" } = req.body;
    console.log("Issuing badge for:", { email, firstName, lastName });

    if (!email) return res.status(400).json({ error: "Email is required." });

    try {
        const accessToken = await getAccessToken();

        const badgeResponse = await fetch(ISSUE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                badge_id: BADGE_ID,
                email,
                first_name: firstName,
                last_name: lastName,
                language: "en",
                send_email: true
            })
        });

        const result = await badgeResponse.json();

        if (!badgeResponse.ok) {
            return res.status(badgeResponse.status).json({
                error: result.message || "Badge issue failed",
                details: result
            });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("OBF Badge Issuer backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});
