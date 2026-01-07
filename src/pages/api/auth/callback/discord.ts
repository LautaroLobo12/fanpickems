import type { APIRoute } from 'astro';
import axios from 'axios';
import { adminAuth } from '../../../../scripts/firebase-admin';

export const GET: APIRoute = async ({ url, redirect }) => {
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response('Missing authorization code', { status: 400 });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: import.meta.env.DISCORD_CLIENT_ID || '',
                client_secret: import.meta.env.DISCORD_CLIENT_SECRET || '',
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: import.meta.env.DISCORD_REDIRECT_URI || '',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token } = tokenResponse.data;

        // 2. Fetch user info from Discord
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const discordUser = userResponse.data;
        const discordId = discordUser.id;

        const displayName = discordUser.global_name || discordUser.username;
        const photoURL = discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
            : null;

        // 3. Update or Create User in Firebase Auth
        // This ensures user.displayName and user.email are set for the frontend
        const uid = `discord:${discordId}`;
        try {
            await adminAuth.updateUser(uid, {
                email: discordUser.email,
                displayName: displayName,
                photoURL: photoURL,
            });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                await adminAuth.createUser({
                    uid: uid,
                    email: discordUser.email,
                    displayName: displayName,
                    photoURL: photoURL,
                });
            } else {
                console.error('Error updating/creating Firebase user:', error);
            }
        }

        // 4. Create Firebase Custom Token
        const customToken = await adminAuth.createCustomToken(uid);

        // 4. Redirect back to a page that will handle the login
        // We pass the token in a hash or query param (hash is safer as it doesn't go to server logs)
        return redirect(`/#token=${customToken}`);
    } catch (error: any) {
        console.error('Discord Auth Error:', error.response?.data || error.message);
        return new Response('Authentication failed', { status: 500 });
    }
};
