require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SECRET_KEY = "your_secret_key"; // Change this in production!

app.use(cors());
app.use(express.json());

// Verify Google ID Token
app.post("/verify-token", async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const userId = payload["sub"];
        const email = payload["email"];
        const name = payload["name"];
        const picture = payload["picture"];

        // Generate a session token (JWT)
        const sessionToken = jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ success: true, sessionToken, user: { userId, email, name, picture } });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
});

// Logout route
app.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
