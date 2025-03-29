"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { PhoneCodeFactor } from "@clerk/types";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [verifying, setVerifying] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: "91" + phone,
      });
      const phoneCodeFactor = supportedFirstFactors?.find(
        (factor): factor is PhoneCodeFactor => factor.strategy === "phone_code"
      );

      if (phoneCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId: phoneCodeFactor.phoneNumberId,
        });
        setVerifying(true);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        console.error("Verification failed", signInAttempt);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center">
          {verifying ? "Verify Code" : "Welcome Back!"}
        </h1>
        <p className="text-gray-500 text-center mt-2">
          {verifying
            ? "Enter the OTP sent to your phone"
            : "Enter your phone number to sign in"}
        </p>

        <form
          onSubmit={verifying ? handleVerification : handleSubmit}
          className="mt-6 space-y-4"
        >
          {!verifying ? (
            <div className="flex">
              <span className="px-3 bg-gray-200 border border-r-0 rounded-l-md text-center">
                +91
              </span>
              <Input
                type="tel"
                placeholder="9876543210"
                className="rounded-l-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          ) : (
            <Input
              type="text"
              placeholder="123456"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : verifying ? (
              "Verify"
            ) : (
              "Sign In"
            )}
          </Button>

          {verifying && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setVerifying(false);
                setPhone("");
              }}
            >
              Change Phone Number
            </Button>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            New here?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              Sign up now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
