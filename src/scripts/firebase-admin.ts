import admin from 'firebase-admin';

const projectId = import.meta.env.FIREBASE_PROJECT_ID;
const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL;
const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase Admin credentials missing from environment variables.');
    } else {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
