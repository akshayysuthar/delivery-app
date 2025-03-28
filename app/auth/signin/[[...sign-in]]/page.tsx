"use client";

import { SetStateAction, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSignIn } from "@clerk/nextjs";
import { PhoneCodeFactor, SignInFirstFactor } from "@clerk/types";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number" })
    .max(10, { message: "Please enter a valid phone number" }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "Please enter the 6-digit code" })
    .max(6, { message: "Please enter the 6-digit code" }),
});

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onPhoneSubmit(values: { phone: string }) {
    setIsLoading(true);
    try {
      if (!isLoaded || !signIn) return;

      const { supportedFirstFactors } = await signIn.create({
        identifier: "91" + values.phone,
      });
      const isPhoneCodeFactor = (factor: SignInFirstFactor) =>
        factor.strategy === "phone_code";
      const phoneCodeFactor = supportedFirstFactors?.find(isPhoneCodeFactor);

      if (phoneCodeFactor) {
        const { phoneNumberId } = phoneCodeFactor;

        await signIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId,
        });

        // Reset OTP form first
        otpForm.reset();
        // Then update other states
        setOtpSent(true);
        setPhoneNumber(values.phone);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onOtpSubmit(values: { otp: any }) {
    setIsLoading(true);
    try {
      if (!isLoaded || !signIn) return;

      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: values.otp,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-2">
            {otpSent
              ? "Enter the verification code sent to your phone"
              : "Enter your phone number to continue"}
          </p>
        </div>

        {!otpSent ? (
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
              className="space-y-4"
            >
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                          +91
                        </span>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          className="rounded-l-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Continue with Phone"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-4"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        value={field.value || ""} // Explicitly set value
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, ""))
                        } // Only allow digits
                        // {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setOtpSent(false);
                  setPhoneNumber("");
                  otpForm.reset();
                }}
              >
                Change Phone Number
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
