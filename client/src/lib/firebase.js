import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCswUXOdTPJf21xdFHBRrntoxuk3dwOUDA",
  authDomain: "tacir-app.firebaseapp.com",
  projectId: "tacir-app",
  storageBucket: "tacir-app.firebasestorage.app",
  messagingSenderId: "599404203008",
  appId: "1:599404203008:web:c352e3970729dd9da15ce5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messagingInstance = null;
let swRegistration = null;
let pendingInit = null;

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  if (messagingInstance) return messagingInstance;
  if (pendingInit) return pendingInit;

  pendingInit = (async () => {
    try {
      swRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      await navigator.serviceWorker.ready;
      console.log("✅ SW enregistré:", swRegistration.scope);
      messagingInstance = getMessaging(app);
      return messagingInstance;
    } catch (error) {
      console.error("❌ Erreur SW:", error);
      return null;
    } finally {
      pendingInit = null;
    }
  })();

  return pendingInit;
};

export const getSwRegistration = () => swRegistration;

export { getToken, onMessage };