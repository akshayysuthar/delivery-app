"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/supabase"
import { siteConfig } from "@/config/site"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any; user: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is admin
  const isAdmin = user?.email === siteConfig.adminEmail

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Get user profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          phone: profile?.phone || "",
          full_name: profile?.full_name || "",
          created_at: profile?.created_at || session.user.created_at,
        })
      }

      setIsLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Get user profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          phone: profile?.phone || "",
          full_name: profile?.full_name || "",
          created_at: profile?.created_at || session.user.created_at,
        })
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      })

      router.push("/")
      return { error: null }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
        return { error, user: null }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: email,
            full_name: userData.full_name,
            phone: userData.phone,
          },
        ])

        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          })
          return { error: profileError, user: null }
        }

        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account",
        })

        router.push("/auth/verify")
        return { error: null, user: data.user }
      }

      return { error: new Error("User creation failed"), user: null }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return { error, user: null }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    toast({
      title: "Signed out successfully",
    })
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link",
      })

      return { error: null }
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return { error }
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      return { error: new Error("Not authenticated") }
    }

    try {
      const { error } = await supabase.from("profiles").update(data).eq("id", user.id)

      if (error) {
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      // Update local user state
      setUser({ ...user, ...data })

      toast({
        title: "Profile updated successfully",
      })

      return { error: null }
    } catch (error) {
      toast({
        title: "Profile update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

