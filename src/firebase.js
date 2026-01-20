// Configura aquí tus credenciales de Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD0ZvWghWQVPAiyZJfi6usKF6o3Su6bmiI",
  authDomain: "gym-app-329cf.firebaseapp.com",
  databaseURL: "https://gym-app-329cf-default-rtdb.firebaseio.com",
  projectId: "gym-app-329cf",
  storageBucket: "gym-app-329cf.appspot.com",
  messagingSenderId: "104581832630",
  appId: "1:104581832630:web:447bcafabf4ccb726e6b17"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
