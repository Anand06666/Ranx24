import admin from "firebase-admin";

let firebaseApp = null;

const initializeFirebase = async () => {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            console.log("🔐 Loading Firebase config from BASE64 env var");

            const decoded = Buffer.from(
                process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
                "base64"
            ).toString("utf8");

            const serviceAccount = JSON.parse(decoded);

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            console.log("🔥 Firebase Admin Initialized Successfully");
        } else {
            // Fallback to local file for development
            const path = await import("path");
            const fs = await import("fs");
            const { fileURLToPath } = await import("url");

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            // Look in root backend folder (one level up from config)
            const serviceAccountPath = path.join(__dirname, "..", "firebase-credentials.json");

            if (fs.existsSync(serviceAccountPath)) {
                console.log("🔹 Loading Firebase config from local file:", serviceAccountPath);
                // Read and strip BOM if present
                const rawData = fs.readFileSync(serviceAccountPath, "utf8").replace(/^\uFEFF/, '');
                const serviceAccount = JSON.parse(rawData);
                firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("🔥 Firebase Admin Initialized from File Successfully");
            } else {
                console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_BASE64 missing and no local file found. Push notifications disabled.");
            }
        }
    } catch (error) {
        console.error("❌ Error initializing Firebase Admin:", error);
    }
};

// Initialize immediately
initializeFirebase();

export default firebaseApp;
