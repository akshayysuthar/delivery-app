"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useSound } from "@/context/sound-context"

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "Please enter the 6-digit code" })
    .max(6, { message: "Please enter the 6-digit code" }),
})

export default function VerifyPage() {
  const { verifyOTP } = useAuth()
  const { playSound } = useSound()
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || ""

  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    if (!phone) {
      router.push("/auth/signin")
      return
    }

    let timer: NodeJS.Timeout
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else {
      setCanResend(true)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown, canResend, phone, router])

  async function onSubmit(values: z.infer<typeof otpSchema>) {
    setIsLoading(true)
    playSound("click")

    try {
      const { error, user } = await verifyOTP(phone, values.otp)

      if (!error && user) {
        playSound("success")
        // The redirect is handled in the auth context
      } else {
        playSound("error")
      }
    } catch (error) {
      playSound("error")
      console.error("Verification error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendCode() {
    // Implement resend code logic here
    setCanResend(false)
    setCountdown(30)
    // Call your resend OTP function
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify Your Phone</h1>
          <p className="text-muted-foreground mt-2">We've sent a verification code to {phone}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            {canResend ? (
              <Button variant="link" className="p-0 h-auto" onClick={handleResendCode}>
                Resend Code
              </Button>
            ) : (
              <span>Resend in {countdown}s</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

