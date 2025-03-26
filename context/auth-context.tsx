"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase-client";
import { siteConfig } from "@/config/site";
import { useToast } from "@/components/ui/use-toast";

export type User = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  created_at: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ error: any; user: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
  hasAddress: boolean;
  checkHasAddress: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAddress, setHasAddress] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user: clerkUser, isLoaded } = useUser();
  const { signIn: clerkSignIn } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();
  const { signOut: clerkSignOut, setActive } = useClerk();

  const isAdmin =
    clerkUser?.primaryEmailAddress?.emailAddress === siteConfig.adminEmail;

  useEffect(() => {
    if (!isLoaded) return;

    const syncUserWithProfile = async () => {
      if (clerkUser) {
        const clerkUserData: User = {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          phone: (clerkUser.unsafeMetadata?.phone as string) || null,
          full_name: clerkUser.fullName || null,
          created_at: clerkUser.createdAt
            ? new Date(clerkUser.createdAt).toISOString()
            : "",
        };

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_uuid", clerkUser.id)
          .single();

        if (profile) {
          setUser({
            ...clerkUserData,
            phone: profile.phone || clerkUserData.phone,
            full_name: profile.full_name || clerkUserData.full_name,
          });
          await checkHasAddress();
        } else {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_uuid: clerkUser.id, // String, should work with TEXT column
              email: clerkUserData.email || "", // Ensure non-null
              full_name: clerkUserData.full_name,
              phone: clerkUserData.phone,
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            toast({
              title: "Profile creation failed",
              description: profileError.message,
              variant: "destructive",
            });
          } else {
            setUser(clerkUserData);
          }
          setHasAddress(false);
        }
      } else {
        setUser(null);
        setHasAddress(false);
      }
      setIsLoading(false);
    };

    syncUserWithProfile();
  }, [clerkUser, isLoaded]);

  const checkHasAddress = async () => {
    if (!clerkUser) {
      setHasAddress(false);
      return false;
    }

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", clerkUser.id)
      .limit(1);

    const hasAddressValue = !error && addresses && addresses.length > 0;
    setHasAddress(hasAddressValue);
    return hasAddressValue;
  };

  const signIn = async (email: string, password: string) => {
    if (!clerkSignIn) return { error: new Error("Sign-in not initialized") };

    try {
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const hasAddress = await checkHasAddress();
        router.push(hasAddress ? "/" : "/account/addresses/new?first=true");
        return { error: null };
      } else {
        return { error: new Error("Sign-in incomplete") };
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    if (!clerkSignIn) return { error: new Error("Sign-in not initialized") };

    try {
      await clerkSignIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/account/addresses/new?first=true`,
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    if (!clerkSignUp)
      return { error: new Error("Sign-up not initialized"), user: null };

    try {
      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
        firstName: userData.full_name?.split(" ")[0] || "",
        lastName: userData.full_name?.split(" ").slice(1).join(" ") || "",
        unsafeMetadata: { phone: userData.phone },
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const newUser = {
          id: result.createdUserId,
          email: email || "",
          phone: userData.phone || null,
          full_name: userData.full_name || null,
          created_at: new Date().toISOString(),
        };
        const { error: profileError } = await supabase.from("profiles").insert({
          user_uuid: result.createdUserId || "",
          email: email || "",
          full_name: userData.full_name,
          phone: userData.phone,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }

        toast({
          title: "Account created successfully",
        });
        router.push("/account/addresses/new?first=true");
        return { error: null, user: newUser };
      } else {
        toast({
          title: "Sign up initiated",
          description: "Please check your email to verify your account",
        });
        return { error: null, user: null };
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error, user: null };
    }
  };

  const signOut = async () => {
    await clerkSignOut();
    setUser(null);
    setHasAddress(false);
    router.push("/");
    toast({
      title: "Signed out successfully",
    });
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(
        "https://api.clerk.dev/v1/users/reset_password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Password reset failed");
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link",
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Password reset failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!clerkUser) return { error: new Error("Not authenticated") };

    try {
      await clerkUser.update({
        firstName: data.full_name?.split(" ")[0] || clerkUser.firstName,
        lastName:
          data.full_name?.split(" ").slice(1).join(" ") || clerkUser.lastName,
        unsafeMetadata: {
          phone: data.phone || clerkUser.unsafeMetadata?.phone,
        },
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
        })
        .eq("user_uuid", clerkUser.id);

      if (error) throw error;

      setUser({ ...user!, ...data });
      toast({
        title: "Profile updated successfully",
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Profile update failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        hasAddress,
        checkHasAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
