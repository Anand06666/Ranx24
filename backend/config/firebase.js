import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables initialized within the try-catch logic
let firebaseApp = null;
let serviceAccount = null;

try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('🔹 Loading Firebase config from FIREBASE_SERVICE_ACCOUNT env var');
        // Handle potential escaped newlines in env vars
        const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
        serviceAccount = JSON.parse(jsonString);
    } else if (fs.existsSync(serviceAccountPath)) {
        console.log('🔹 Loading Firebase config from local file:', serviceAccountPath);
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    } else {
        console.warn('⚠️ No Firebase configuration found (Env var or File). Push notifications will not work.');
    }

    if (serviceAccount) {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin Initialized Successfully');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
}

export default firebaseApp;
