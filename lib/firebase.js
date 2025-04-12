// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzb0e302XKhLU6UDEd4K0xi3t-5EtOsAo",
  authDomain: "bioprocess-designer-v0.firebaseapp.com",
  projectId: "bioprocess-designer-v0",
  storageBucket: "bioprocess-designer-v0.firebasestorage.app",
  messagingSenderId: "31849551651",
  appId: "1:31849551651:web:7a15aa61ef346b6d1a1e96",
  measurementId: "G-LR8GLMXWZL",
}

// Initialize Firebase only on the client side
let app = null

// This function ensures Firebase is initialized only once and only on the client side
export function getFirebaseApp() {
  if (typeof window !== "undefined" && !app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

const firebaseApp = getFirebaseApp()

export default firebaseApp
