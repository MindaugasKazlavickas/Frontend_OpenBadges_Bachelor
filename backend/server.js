const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    badge_id: BADGE_ID
} = process.env;

const TOKEN_URL = "https://openbadgefactory.com/v2/client/oauth2/token";

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

        if (!response.ok) throw new Error(`Failed to get access token (${response.status})`);

        const data = JSON.parse(text);
        return data.access_token;
    } catch (err) {
        console.error("Access token error:", err.message);
        throw err;
    }
}

async function checkBadgeIssued(email, accessToken) {
    const searchUrl = `https://openbadgefactory.com/v2/event/${CLIENT_ID}?email=${encodeURIComponent(email)}`;
    console.log("Checking for existing badge at:", searchUrl);

    const checkResponse = await fetch(searchUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });

    const checkText = await checkResponse.text();
    console.log("Badge check response (raw):", checkText);

    let checkResult;
    try {
        checkResult = JSON.parse(checkText);
    } catch (err) {
        throw new Error("Invalid JSON from OBF during badge check");
    }

    const badgeAlreadyIssued = Array.isArray(checkResult.result) && checkResult.result.length > 0;
    return badgeAlreadyIssued;
}

app.post("/issue-obf-badge", async (req, res) => {
    const { email, firstName = "", lastName = "", score = null, language = "en" } = req.body;
    console.log("=== Badge Issuing Request Received ===");
    console.log("User details:", { email, firstName, lastName, score, language });

    if (!email) return res.status(400).json({ error: "Email is required." });

    try {
        const accessToken = await getAccessToken();
        console.log("Access token received:", accessToken.slice(0, 20) + "...");

        const badgeAlreadyIssued = await checkBadgeIssued(email, accessToken);

        if (badgeAlreadyIssued) {
            console.warn("Badge already issued for this email. Aborting issuance.");
            return res.status(409).json({ error: "already issued" });
        }

        const localizedPath = path.join(__dirname, "request.json");
        const localizedText = JSON.parse(fs.readFileSync(localizedPath, "utf-8"));
        const t = localizedText[language] || localizedText["en"];

        const badgePayload = {
            event_name: "completed-course",
            recipient: [
                {
                    email,
                    name: `${firstName} ${lastName}`
                }
            ],
            issued_on: Math.floor(Date.now() / 1000),
            api_consumer_id: "standalone",
            send_email: true,
            show_report: true,
            criteria_add: `${t.addendum}${score}${t.addendumEnd}`,
            email_message: {
                subject: t.subject,
                body: t.body,
                link_text: t.link_text,
                footer: t.footer
            }
        };

        console.log("Badge issue payload:", badgePayload);

        const badgeResponse = await fetch(`https://openbadgefactory.com/v2/event/${CLIENT_ID}/${BADGE_ID}/issue`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(badgePayload)
        });

        const resultText = await badgeResponse.text();
        console.log("Badge response (raw):", resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (err) {
            console.error("Failed to parse badge issue response:", err.message);
            return res.status(500).json({ error: "Invalid JSON from OBF", raw: resultText });
        }

        if (!badgeResponse.ok) {
            console.error("Badge issue failed:", result);
            return res.status(badgeResponse.status).json({
                error: result.message || "Badge issue failed",
                details: result
            });
        }

        console.log("Badge issued successfully:", result);
        return res.status(200).json({ success: true, data: result });

    } catch (err) {
        console.error("Fatal error during badge issuing:", err.message);
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