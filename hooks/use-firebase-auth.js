"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"

export function useFirebaseAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState(null)
  const [db, setDb] = useState(null)

  // Initialize Firebase services
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Get Firebase app
    const app = getFirebaseApp()

    // Initialize auth and firestore only after app is initialized
    if (app) {
      const authInstance = getAuth(app)
      setAuth(authInstance)

      const dbInstance = getFirestore(app)
      setDb(dbInstance)
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  return { user, loading, auth, db }
}
