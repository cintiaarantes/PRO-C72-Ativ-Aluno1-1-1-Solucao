import firebase from "firebase";
require("@firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyBRH_r_9GpGZG-J1q1Gvf5O8icDU9MjpIU",
    authDomain: "biblioteca-863a5.firebaseapp.com",
    projectId: "biblioteca-863a5",
    storageBucket: "biblioteca-863a5.appspot.com",
    messagingSenderId: "616859987911",
    appId: "1:616859987911:web:ce29b5c57e71300505f3e2"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();