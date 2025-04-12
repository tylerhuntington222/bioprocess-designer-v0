import { getAuth } from "firebase/auth"
import firebaseApp from "./firebase"

// Initialize Firebase Auth only on the client side
let auth = null

if (typeof window !== "undefined" && firebaseApp) {
  auth = getAuth(firebaseApp)
}

export default auth
