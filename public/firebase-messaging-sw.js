importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD0ZvWghWQVPAiyZJfi6usKF6o3Su6bmiI",
  authDomain: "gym-app-329cf.firebaseapp.com",
  projectId: "gym-app-329cf",
  storageBucket: "gym-app-329cf.appspot.com",
  messagingSenderId: "104581832630",
  appId: "1:104581832630:web:447bcafabf4ccb726e6b17"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png',
  });
});
