"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Home, Building, Briefcase, MapPin, Loader2 } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/auth-context";
import { useSound } from "@/context/sound-context";
import { supabase, getUserLocation } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/use-toast";

const addressFormSchema = z.object({
  addressType: z.enum(["home", "work", "other"]),
  addressLine1: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  pincode: z
    .string()
    .min(6, { message: "Pincode must be at least 6 characters" }),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(true),
});

export default function NewAddressPage() {
  const { user, checkHasAddress } = useAuth();
  const { playSound } = useSound();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstAddress = searchParams.get("first") === "true";

  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
      isDefault: true,
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    playSound("click");

    try {
      const location = await getUserLocation();

      if (location) {
        setUserLocation(location);
        toast({
          title: "Location detected",
          description: "Your location has been successfully detected.",
        });
      } else {
        toast({
          title: "Location detection failed",
          description:
            "Please allow location access or enter your address manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: "Location detection failed",
        description: "Please enter your address manually.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  async function onSubmit(values: z.infer<typeof addressFormSchema>) {
    if (!user) return;

    setIsLoading(true);
    playSound("click");

    try {
      const addressTypeLabel =
        values.addressType === "home"
          ? "Home"
          : values.addressType === "work"
          ? "Work"
          : "Other";

      const { error } = await supabase.from("addresses").insert([
        {
          user_id: user.id,
          address_line1: values.addressLine1,
          address_line2: `${addressTypeLabel}: ${values.addressLine2 || ""}`,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          landmark: values.landmark,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          is_default: values.isDefault,
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Address added",
        description: "Your address has been added successfully",
      });

      playSound("success");

      // Update the hasAddress state
      await checkHasAddress();

      // Redirect based on whether this is the first address or not
      if (isFirstAddress) {
        router.push("/");
      } else {
        router.push("/account/addresses");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      playSound("error");

      toast({
        title: "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isFirstAddress ? "Add Your Delivery Address" : "Add New Address"}
      </h1>

      {isFirstAddress && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-700">
            Please add your delivery address to continue. This will help us
            provide you with accurate delivery options.
          </p>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="border rounded-lg p-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Address Details</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Detect Location
                </>
              )}
            </Button>
          </div>

          {userLocation && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
              Location detected successfully! Latitude:{" "}
              {userLocation.latitude.toFixed(6)}, Longitude:{" "}
              {userLocation.longitude.toFixed(6)}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="addressType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
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
                      <Input
                        placeholder="Flat/House No., Society Name"
                        {...field}
                      />
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default address</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
