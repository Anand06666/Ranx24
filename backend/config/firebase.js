import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let firebaseApp = null;

if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error);
    }
} else {
    console.warn('⚠️ serviceAccountKey.json not found in backend/config/. Push notifications will not work.');
}

export default firebaseApp;
