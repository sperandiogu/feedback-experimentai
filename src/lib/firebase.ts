@@ .. @@
 import { initializeApp } from 'firebase/app';
 import { getAuth, GoogleAuthProvider } from 'firebase/auth';
 
-const firebaseConfig = {
-  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
-  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
-  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
-  appId: import.meta.env.VITE_FIREBASE_APP_ID,
-};
+// Firebase configuration with fallback values for development
+const firebaseConfig = {
+  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
+  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
+  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
+  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
+};
 
-// Validate required environment variables
-if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
-  throw new Error('Missing required Firebase environment variables. Please check your .env file.');
-}
+console.log('Firebase config:', firebaseConfig);
 
 // Initialize Firebase
 const app = initializeApp(firebaseConfig);