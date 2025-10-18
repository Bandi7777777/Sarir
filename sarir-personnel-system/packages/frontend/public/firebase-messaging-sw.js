// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDFaflXtH-MKcSpNma73Kr8xBWLd73gNBk",
  authDomain: "sarir-personal-system.firebaseapp.com",
  projectId: "sarir-personal-system",
  storageBucket: "sarir-personal-system.firebasestorage.app",
  messagingSenderId: "563104979890",
  appId: "1:563104979890:web:080725f2652cb52d5362ab",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/images/Logo-Sarir.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
