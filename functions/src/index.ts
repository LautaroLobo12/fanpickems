import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

// Secrets
const discordClientId = defineSecret("DISCORD_CLIENT_ID");
const discordClientSecret = defineSecret("DISCORD_CLIENT_SECRET");

admin.initializeApp();

export const discordAuthRedirect = onRequest(
    { secrets: [discordClientId, discordClientSecret] },
    async (req, res) => {
        const code = req.query.code as string;

        if (!code) {
            res.status(400).send("Missing authorization code");
            return;
        }

        try {
            // 1. Exchange code for access token
            const tokenResponse = await axios.post(
                "https://discord.com/api/oauth2/token",
                new URLSearchParams({
                    client_id: discordClientId.value(),
                    client_secret: discordClientSecret.value(),
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: `https://${process.env.FUNCTION_REGION || "us-central1"}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/discordAuthRedirect`,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const { access_token } = tokenResponse.data;

            // 2. Fetch user info from Discord
            const userResponse = await axios.get("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const discordUser = userResponse.data;
            const discordId = discordUser.id;
            const displayName = discordUser.global_name || discordUser.username;
            const photoURL = discordUser.avatar ?
                `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png` :
                null;

            // 3. Update or Create User in Firebase Auth
            const uid = `discord:${discordId}`;
            try {
                await admin.auth().updateUser(uid, {
                    email: discordUser.email,
                    displayName: displayName,
                    photoURL: photoURL,
                });
            } catch (error: any) {
                if (error.code === "auth/user-not-found") {
                    await admin.auth().createUser({
                        uid: uid,
                        email: discordUser.email,
                        displayName: displayName,
                        photoURL: photoURL,
                    });
                } else {
                    logger.error("Error updating/creating Firebase user:", error);
                }
            }

            // 4. Create Firebase Custom Token
            const customToken = await admin.auth().createCustomToken(uid);

            // 5. Redirect back to the frontend
            res.redirect(`https://fanpickems.lautarolobo.xyz/#token=${customToken}`);
        } catch (error: any) {
            logger.error("Discord Auth Error:", error.response?.data || error.message);
            res.status(500).send("Authentication failed");
        }
    }
);
