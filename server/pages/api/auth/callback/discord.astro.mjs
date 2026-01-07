import axios from 'axios';
import admin from 'firebase-admin';
export { renderers } from '../../../../renderers.mjs';

if (!admin.apps.length) {
  {
    console.warn("Firebase Admin credentials missing from environment variables.");
  }
}
const adminAuth = admin.auth();
admin.firestore();

const GET = async ({ url, redirect }) => {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }
  try {
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: undefined                                  || "",
        client_secret: undefined                                      || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: undefined                                     || ""
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    const discordUser = userResponse.data;
    const discordId = discordUser.id;
    const displayName = discordUser.global_name || discordUser.username;
    const photoURL = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png` : null;
    const uid = `discord:${discordId}`;
    try {
      await adminAuth.updateUser(uid, {
        email: discordUser.email,
        displayName,
        photoURL
      });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        await adminAuth.createUser({
          uid,
          email: discordUser.email,
          displayName,
          photoURL
        });
      } else {
        console.error("Error updating/creating Firebase user:", error);
      }
    }
    const customToken = await adminAuth.createCustomToken(uid);
    return redirect(`/#token=${customToken}`);
  } catch (error) {
    console.error("Discord Auth Error:", error.response?.data || error.message);
    return new Response("Authentication failed", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
