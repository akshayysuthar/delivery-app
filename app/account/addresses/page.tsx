"use client"

import { Label } from "@/components/ui/label"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Edit, Trash2, Check, Home, Building, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/auth-context"
import { useSound } from "@/context/sound-context"
import { supabase, type Address } from "@/lib/supabase"
import { AccountNav } from "@/components/account/account-nav"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const addressFormSchema = z.object({
  addressType: z.enum(["home", "work", "other"]),
  addressLine1: z.string().min(5, { message: "Address must be at least 5 characters" }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  pincode: z.string().min(6, { message: "Pincode must be at least 6 characters" }),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
})

export default function AddressesPage() {
  const { user } = useAuth()
  const { playSound } = useSound()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      addressType: "home",
      addressLine1: "",
      addressLine2: "",
      city: "Surat",
      state: "Gujarat",
      pincode: "",
      landmark: "",
      isDefault: false,
    },
  })

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  useEffect(() => {
    if (editingAddress) {
      form.reset({
        addressType: (editingAddress.address_line2 || "").includes("Home")
          ? "home"
          : (editingAddress.address_line2 || "").includes("Work")
            ? "work"
            : "other",
        addressLine1: editingAddress.address_line1,
        addressLine2: editingAddress.address_line2 || "",
        city: editingAddress.city,
        state: editingAddress.state,
        pincode: editingAddress.pincode,
        landmark: editingAddress.landmark || "",
        isDefault: editingAddress.is_default,
      })
    } else {
      form.reset({
        addressType: "home",
        addressLine1: "",
        addressLine2: "",
        city: "Surat",
        state: "Gujarat",
        pincode: "",
        landmark: "",
        isDefault: addresses.length === 0, // Make default if it's the first address
      })
    }
  }, [editingAddress, form, addresses.length])

  const fetchAddresses = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (error) {
        throw error
      }

      setAddresses(data || [])
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast({
        title: "Failed to load addresses",
        variant: "destructive",
      })
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setIsDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return

    try {
      playSound("click")

      const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id)

      if (error) {
        throw error
      }

      setAddresses(addresses.filter((addr) => addr.id !== addressId))
      playSound("success")

      toast({
        title: "Address deleted",
        description: "Your address has been removed successfully",
      })
    } catch (error) {
      console.error("Error deleting address:", error)
      playSound("error")

      toast({
        title: "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return

    try {
      playSound("click")

      // First, set all addresses to non-default
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)

      // Then set the selected address as default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      // Update local state
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        })),
      )

      playSound("success")

      toast({
        title: "Default address updated",
      })
    } catch (error) {
      console.error("Error setting default address:", error)
      playSound("error")

      toast({
        title: "Failed to update default address",
        variant: "destructive",
      })
    }
  }

  async function onSubmit(values: z.infer<typeof addressFormSchema>) {
    if (!user) return

    setIsLoading(true)
    playSound("click")

    try {
      const addressTypeLabel = values.addressType === "home" ? "Home" : values.addressType === "work" ? "Work" : "Other"

      // If this is set as default, update all other addresses to non-default
      if (values.isDefault) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
      }

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from("addresses")
          .update({
            address_line1: values.addressLine1,
            address_line2: `${addressTypeLabel}: ${values.addressLine2}`,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            landmark: values.landmark,
            is_default: values.isDefault,
          })
          .eq("id", editingAddress.id)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }

        toast({
          title: "Address updated",
          description: "Your address has been updated successfully",
        })
      } else {
        // Create new address
        const { error } = await supabase.from("addresses").insert([
          {
            user_id: user.id,
            address_line1: values.addressLine1,
            address_line2: `${addressTypeLabel}: ${values.addressLine2}`,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            landmark: values.landmark,
            is_default: values.isDefault || addresses.length === 0, // Make default if it's the first address
          },
        ])

        if (error) {
          throw error
        }

        toast({
          title: "Address added",
          description: "Your address has been added successfully",
        })
      }

      // Refresh addresses
      await fetchAddresses()
      playSound("success")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving address:", error)
      playSound("error")

      toast({
        title: "Failed to save address",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAddressTypeIcon = (addressLine2: string | undefined) => {
    if (!addressLine2) return <Home className="h-4 w-4" />

    if (addressLine2.includes("Home")) return <Home className="h-4 w-4" />
    if (addressLine2.includes("Work")) return <Briefcase className="h-4 w-4" />
    return <Building className="h-4 w-4" />
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please sign in to manage your addresses.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Addresses</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Saved Addresses</h2>
            <Button onClick={handleAddAddress}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">You don&apos;t have any saved addresses yet.</p>
              <Button onClick={handleAddAddress}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getAddressTypeIcon(address.address_line2)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{address.address_line2?.split(":")[0] || "Address"}</h3>
                          {address.is_default && (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{address.address_line1}</p>
                        <p className="text-sm">{address.address_line2?.split(":")[1]?.trim()}</p>
                        {address.landmark && <p className="text-sm">Landmark: {address.landmark}</p>}
                        <p className="text-sm">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!address.is_default && (
                        <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button variant="outline" size="icon" onClick={() => handleEditAddress(address)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteAddress(address.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="addressType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Type</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="home" id="home" />
                              <Label htmlFor="home" className="flex items-center">
                                <Home className="h-4 w-4 mr-2" />
                                Home
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="work" id="work" />
                              <Label htmlFor="work" className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-2" />
                                Work
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other" className="flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                Other
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Flat/House No., Society Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input placeholder="Street, Area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="landmark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landmark (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nearby landmark" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Set as default address</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

