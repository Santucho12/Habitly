// Firebase v9+ modular SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';


const firebaseConfig = {
	apiKey: "AIzaSyD0ZvWghWQVPAiyZJfi6usKF6o3Su6bmiI",
	authDomain: "gym-app-329cf.firebaseapp.com",
	projectId: "gym-app-329cf",
	storageBucket: "gym-app-329cf.appspot.com",
	messagingSenderId: "104581832630",
	appId: "1:104581832630:web:447bcafabf4ccb726e6b17"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

export { app, auth, db, storage, messaging };
