import { getFirestore } from "firebase/firestore"
import firebaseApp from "./firebase"

// Initialize Firestore only on the client side
let db = null

if (typeof window !== "undefined" && firebaseApp) {
  db = getFirestore(firebaseApp)
}

export default db
