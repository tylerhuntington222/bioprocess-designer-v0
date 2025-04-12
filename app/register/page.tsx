"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FlaskConical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  // Use our custom hook to get auth and db
  const { auth, db, user, loading } = useFirebaseAuth()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      acceptTerms: checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!auth || !db) {
      toast({
        title: "Error",
        description: "Authentication service is not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the terms of service to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Update profile with name
      await updateProfile(user, {
        displayName: formData.name,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <FlaskConical className="h-10 w-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create a BioProcess Designer account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={handleCheckboxChange}
                required
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                I agree to the{" "}
                <Link href="#" className="text-emerald-600 hover:text-emerald-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-emerald-600 hover:text-emerald-500">
                  Privacy Policy
                </Link>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || loading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
