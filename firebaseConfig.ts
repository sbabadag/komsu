import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyD9WUMAlo5ZCj9QASkGy4P-V4nEytfLB9M",
    authDomain: "komsu-a0920.firebaseapp.com",
    databaseURL: "https://komsu-a0920-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "komsu-a0920",
    storageBucket: "komsu-a0920.firebasestorage.app",
    messagingSenderId: "817455873090",
    appId: "1:817455873090:web:92ea09e22b67b0fdac41db",
    measurementId: "G-6882BNL0WW"
};

// Initialize Firebase once
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

const auth = getAuth();
export { auth };