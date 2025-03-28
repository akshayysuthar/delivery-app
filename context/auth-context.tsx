// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   type ReactNode,
// } from "react";
// import { useRouter } from "next/navigation";
// import { useUser, useSignIn, useClerk, SignIn } from "@clerk/nextjs";
// import { siteConfig } from "@/config/site";
// import { useToast } from "@/components/ui/use-toast";

// export type User = {
//   id: string;
//   email: string | null;
//   phone: string | null;
//   full_name: string | null;
//   created_at: string;
// };

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   isAdmin: boolean;
//   signInWithPhone: (phone: string) => Promise<{ error: any }>;
//   verifyOTP: (phone: string, otp: string) => Promise<{ error: any }>;
//   signInWithGoogle: () => Promise<{ error: any }>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const { user: clerkUser, isLoaded } = useUser();
//   const { signIn } = useSignIn() || { signIn: undefined };
//   const { signOut } = useClerk();
//   const [user, setUser] = useState<User | null>(null);
//   const router = useRouter();
//   const { toast } = useToast();

//   const isAdmin = user?.email === siteConfig.adminEmail;

//   useEffect(() => {
//     if (isLoaded && clerkUser) {
//       setUser({
//         id: clerkUser.id,
//         email: clerkUser.primaryEmailAddress?.emailAddress || null,
//         phone: clerkUser.primaryPhoneNumber?.phoneNumber || null,
//         full_name: clerkUser.fullName || null,
//         created_at: clerkUser.createdAt ? clerkUser.createdAt.toString() : "",
//       });
//     } else {
//       setUser(null);
//     }
//   }, [clerkUser, isLoaded]);

//   const signInWithGoogle = async () => {
//     try {
//       if (!signIn) throw new Error("Sign-in is not initialized.");

//       await signIn.authenticateWithRedirect({
//         strategy: "oauth_google",
//         redirectUrl: "/auth/callback",
//         redirectUrlComplete: "/", // Redirect to home or dashboard after successful login
//       });

//       return { error: null };
//     } catch (error) {
//       const err =
//         error instanceof Error ? error.message : "An unknown error occurred";
//       toast({
//         title: "Google Sign-in failed",
//         description: err,
//         variant: "destructive",
//       });
//       return { error };
//     }
//   };

//   const signInWithPhone = async (phone: string) => {
//     try {
//       if (!signIn) throw new Error("Sign-in is not initialized.");
//       const { supportedFirstFactors } = await signIn.create({
//         identifier: phone,
//       });

//       if (!supportedFirstFactors || supportedFirstFactors.length === 0) {
//         throw new Error("Phone authentication is not supported.");
//       }

//       toast({
//         title: "Verification code sent",
//         description: `We've sent a code to ${phone}`,
//       });
//       return { error: null, isNewUser: true }; // ✅ Add isNewUser
//     } catch (error) {
//       const err =
//         error instanceof Error ? error.message : "An unknown error occurred";
//       toast({
//         title: "Sign in failed",
//         description: err,
//         variant: "destructive",
//       });
//       return { error, isNewUser: false }; // ✅ Include isNewUser for consistency
//     }
//   };

//   const verifyOTP = async (phone: string, otp: string) => {
//     try {
//       if (!signIn) throw new Error("Sign-in is not initialized.");
//       const completeSignIn = await signIn.attemptFirstFactor({
//         strategy: "phone_code",
//         code: otp,
//       });

//       if (completeSignIn.status === "complete") {
//         router.push("/");
//         return { error: null, sessionId: completeSignIn.createdSessionId }; // ✅ Use sessionId instead
//       }
//       throw new Error("Verification failed");
//     } catch (error) {
//       const err =
//         error instanceof Error ? error.message : "An unknown error occurred";
//       toast({
//         title: "Verification failed",
//         description: err,
//         variant: "destructive",
//       });
//       return { error, user: null }; // ✅ Ensure user is returned
//     }
//   };

//   const handleSignOut = async () => {
//     await signOut();
//     setUser(null);
//     router.push("/");
//     toast({ title: "Signed out successfully" });
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading: !isLoaded,
//         isAdmin,
//         signInWithPhone,
//         verifyOTP,
//         signInWithGoogle,
//         signOut: handleSignOut,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }
// async function verifyOTP(phone: string, otp: string) {
//   try {
//     const signIn = new SignIn();
//     const attempt = await signIn.attemptFirstFactor({ code: otp });

//     return {
//       user: attempt.createdSession ? attempt.createdSession.user : null,
//       error: null,
//     };
//   } catch (error) {
//     return { error };
//   }
// }

// async function signInWithPhone(phone: string) {
//   try {
//     const signIn = new SignIn();
//     const attempt = await signIn.create({
//       strategy: "phone_code",
//       identifier: phone,
//     });

//     return {
//       sessionId: attempt.firstFactorVerification.sessionId,
//       error: null,
//     };
//   } catch (error) {
//     return { error };
//   }
// }

// export function useAuth() {
//   const { user } = useUser();
//   const context = useContext(AuthContext);
//   async function updateProfile(data: { full_name: string }) {
//     if (user) {
//       await user.update({ firstName: data.full_name });
//     }
//   }
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
//   return {
//     updateProfile,
//     signInWithPhone,
//     verifyOTP,
//   };
// }
