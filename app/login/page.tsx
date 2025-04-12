"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlaskConical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Use our custom hook to get auth
  const { auth, user, loading } = useFirebaseAuth()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!auth) {
      toast({
        title: "Error",
        description: "Authentication service is not available. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
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
          <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password to access your BioProcess Designer account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-500">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || loading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-emerald-600 hover:text-emerald-500">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
