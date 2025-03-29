// "use client";

// import * as React from "react";
// import { useSignIn } from "@clerk/nextjs";
// import { PhoneCodeFactor } from "@clerk/types";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// export default function SignInPage() {
//   const { isLoaded, signIn, setActive } = useSignIn();
//   const [loginMethod, setLoginMethod] = React.useState<"phone" | "email">(
//     "phone"
//   );
//   const [verifying, setVerifying] = React.useState(false);
//   const [phone, setPhone] = React.useState("");
//   const [email, setEmail] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [code, setCode] = React.useState("");
//   const [loading, setLoading] = React.useState(false);
//   const router = useRouter();

//   async function checkEmailExists() {
//     try {
//       if (!isLoaded || !signIn) return false;
//       await signIn.create({ identifier: email });
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   async function handleSignIn(e: React.FormEvent) {
//     e.preventDefault();
//     if (!isLoaded || !signIn) return;
//     setLoading(true);

//     try {
//       if (loginMethod === "phone") {
//         // Try phone login
//         const { supportedFirstFactors } = await signIn.create({
//           identifier: "91" + phone,
//         });

//         const phoneCodeFactor = supportedFirstFactors?.find(
//           (factor): factor is PhoneCodeFactor =>
//             factor.strategy === "phone_code"
//         );

//         if (phoneCodeFactor) {
//           await signIn.prepareFirstFactor({
//             strategy: "phone_code",
//             phoneNumberId: phoneCodeFactor.phoneNumberId,
//           });
//           setVerifying(true);
//         } else {
//           toast.error("Phone login is not available. Try email login instead.");
//           setLoginMethod("email");
//         }
//       } else {
//         // Try email login
//         const emailExists = await checkEmailExists();
//         if (!emailExists) {
//           toast.error("Email not found. Please use phone login.");
//           setLoginMethod("phone");
//           return;
//         }

//         const signInAttempt = await signIn.create({
//           identifier: email,
//           password,
//         });

//         if (signInAttempt.status === "complete") {
//           await setActive({ session: signInAttempt.createdSessionId });
//           router.push("/");
//         } else {
//           toast.error("Email login failed. Check credentials.");
//         }
//       }
//     } catch (err) {
//       console.error("Error:", err);
//       toast.error("Login failed. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handlePhoneVerification(e: React.FormEvent) {
//     e.preventDefault();
//     if (!isLoaded || !signIn) return;
//     setLoading(true);

//     try {
//       const signInAttempt = await signIn.attemptFirstFactor({
//         strategy: "phone_code",
//         code,
//       });

//       if (signInAttempt.status === "complete") {
//         await setActive({ session: signInAttempt.createdSessionId });
//         router.push("/");
//       } else {
//         toast.error("Invalid OTP. Please try again.");
//       }
//     } catch (err) {
//       toast.error("Verification failed. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4">
//       <div className="bg-white shadow-xl rounded-2xl p-6 max-w-sm w-full">
//         <h1 className="text-2xl font-bold text-center">
//           {verifying ? "Verify Code" : "Sign In"}
//         </h1>
//         <p className="text-gray-500 text-center mt-2">
//           {verifying
//             ? "Enter the OTP sent to your phone"
//             : "Choose how you'd like to sign in"}
//         </p>

//         {!verifying && (
//           <div className="flex justify-center mt-4">
//             <button
//               className={`px-4 py-2 text-sm font-semibold rounded-l-md ${
//                 loginMethod === "phone"
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-200"
//               }`}
//               onClick={() => setLoginMethod("phone")}
//             >
//               Phone
//             </button>
//             <button
//               className={`px-4 py-2 text-sm font-semibold rounded-r-md ${
//                 loginMethod === "email"
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-200"
//               }`}
//               onClick={() => setLoginMethod("email")}
//             >
//               Email
//             </button>
//           </div>
//         )}

//         <form
//           onSubmit={verifying ? handlePhoneVerification : handleSignIn}
//           className="mt-6 space-y-4"
//         >
//           {loginMethod === "phone" && !verifying && (
//             <div className="flex">
//               <span className="px-3 bg-gray-200 border border-r-0 rounded-l-md text-center">
//                 +91
//               </span>
//               <Input
//                 type="tel"
//                 placeholder="9876543210"
//                 className="rounded-l-none"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 required
//               />
//             </div>
//           )}

//           {loginMethod === "email" && !verifying && (
//             <>
//               <Input
//                 type="email"
//                 placeholder="Email Address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <Input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </>
//           )}

//           {verifying && (
//             <Input
//               type="text"
//               placeholder="123456"
//               maxLength={6}
//               className="text-center text-lg tracking-widest"
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               required
//             />
//           )}

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : verifying ? (
//               "Verify"
//             ) : (
//               "Continue"
//             )}
//           </Button>

//           {verifying && (
//             <Button
//               type="button"
//               variant="ghost"
//               className="w-full"
//               onClick={() => {
//                 setVerifying(false);
//                 setPhone("");
//               }}
//             >
//               Change Phone Number
//             </Button>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }

import { SignIn } from "@clerk/nextjs";
import React from "react";

// type Props = {};

const page = () => {
  return <div className="flex items-center justify-center h-screen">
    <SignIn />
  </div>;
};

export default page;
