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
            logger.info("Starting Discord Auth for code:", code);
            // 1. Exchange code for access token
            const redirectUri = `https://${process.env.FUNCTION_REGION || "us-central1"}-lck-pickems.cloudfunctions.net/discordAuthRedirect`;
            logger.info("Using redirectUri for token swap:", redirectUri);

            const tokenResponse = await axios.post(
                "https://discord.com/api/oauth2/token",
                new URLSearchParams({
                    client_id: discordClientId.value(),
                    client_secret: discordClientSecret.value(),
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: redirectUri,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const { access_token } = tokenResponse.data;
            logger.info("Successfully obtained access token");

            // 2. Fetch user info from Discord
            const userResponse = await axios.get("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const discordUser = userResponse.data;
            logger.info("Fetched Discord user:", discordUser.username);
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
                logger.info("Updated existing user:", uid);
            } catch (error: any) {
                if (error.code === "auth/user-not-found") {
                    await admin.auth().createUser({
                        uid: uid,
                        email: discordUser.email,
                        displayName: displayName,
                        photoURL: photoURL,
                    });
                    logger.info("Created new user:", uid);
                } else {
                    logger.error("Error updating/creating Firebase user:", error);
                    throw error;
                }
            }

            // 4. Create Firebase Custom Token
            const customToken = await admin.auth().createCustomToken(uid);
            logger.info("Created custom token for:", uid);

            // 5. Redirect back to the frontend
            res.redirect(`https://fanpickems.lautarolobo.xyz/#token=${customToken}`);
        } catch (error: any) {
            const errorData = error.response?.data;
            logger.error("Discord Auth Error Details:", JSON.stringify(errorData || error.message));
            res.status(500).send(`Authentication failed: ${error.message}`);
        }
    }
);
