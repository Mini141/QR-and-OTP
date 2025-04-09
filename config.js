// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGS-pJEzaczjKLJYzmH9SfTUdbA4Wog5s",
    authDomain: "attendence-a0f9f.firebaseapp.com",
    projectId: "attendence-a0f9f",
    storageBucket: "attendence-a0f9f.firebasestorage.app",
    messagingSenderId: "399592495310",
    appId: "1:399592495310:web:f9f2b70e4318486034d89f",
    // Update database URL to correct region
    databaseURL: "https://attendence-a0f9f-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase with additional settings for cookie handling
const app = firebase.initializeApp(firebaseConfig);

// Configure Firebase Auth to use local persistence
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('Firebase persistence set to LOCAL');
    })
    .catch((error) => {
        console.error('Error setting persistence:', error);
    });

// Initialize Realtime Database with offline persistence enabled
const database = firebase.database();
database.goOnline();
database.ref('.info/connected').on('value', (snap) => {
    if (snap.val() === true) {
        console.log('Connected to Firebase Realtime Database');
    } else {
        console.log('Disconnected from Firebase Realtime Database');
    }
}); 