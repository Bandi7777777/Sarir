// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
let messaging = null;

// فقط توی مرورگر اجرا بشه
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
  }
}

export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.error("Firebase Messaging is not available in this environment");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BK7aerLteKZk7BIjPT_VlXb61xxBMgh9SuWJDMmrod_5gMhr92i4BpgPpxHWhNDAfEy6ix9249oKXKOovrnsmJs",
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) {
    console.error("Firebase Messaging is not available in this environment");
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};
