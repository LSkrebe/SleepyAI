import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBKlPgG94_cl9EH0nnPvKmoJFFZ22ffNDc",
  authDomain: "sleepyai-e5788.firebaseapp.com",
  projectId: "sleepyai-e5788",
  storageBucket: "sleepyai-e5788.firebasestorage.app",
  messagingSenderId: "655523200451",
  appId: "1:655523200451:web:8992642d5cf53884261176",
  measurementId: "G-G42BWHPY3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 