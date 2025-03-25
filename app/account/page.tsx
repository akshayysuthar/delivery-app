"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Package, MapPin, CreditCard, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useSound } from "@/context/sound-context"
import Link from "next/link"
import { AccountNav } from "@/components/account/account-nav"

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
})

export default function AccountPage() {
  const { user, updateProfile } = useAuth()
  const { playSound } = useSound()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  })

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsLoading(true)
    playSound("click")

    try {
      const { error } = await updateProfile({
        full_name: values.fullName,
        phone: values.phone,
      })

      if (!error) {
        playSound("success")
      } else {
        playSound("error")
      }
    } catch (error) {
      playSound("error")
      console.error("Profile update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please sign in to view your account.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Account Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-4 border rounded-md">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Orders</p>
                    <p className="text-sm text-muted-foreground">View your order history</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border rounded-md">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Addresses</p>
                    <p className="text-sm text-muted-foreground">Manage your delivery addresses</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border rounded-md">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Payment Methods</p>
                    <p className="text-sm text-muted-foreground">Manage your payment options</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border rounded-md">
                  <Settings className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Preferences</p>
                    <p className="text-sm text-muted-foreground">Update your account settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

