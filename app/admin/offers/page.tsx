"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { AdminNav } from "@/components/admin/admin-nav";
import { useAuth } from "@/context/auth-context";
import { supabase, uploadOfferImage } from "@/lib/supabase-client";

const offerSchema = z.object({
  code: z
    .string()
    .min(3, { message: "Code must be at least 3 characters" })
    .toUpperCase(),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  discount_percentage: z.coerce
    .number()
    .min(1, { message: "Discount must be at least 1%" })
    .max(100, { message: "Discount cannot exceed 100%" }),
  min_order_value: z.coerce
    .number()
    .min(0, { message: "Minimum order value must be a positive number" }),
  max_discount_amount: z.coerce
    .number()
    .min(0, { message: "Maximum discount amount must be a positive number" }),
  valid_from: z.string().min(1, { message: "Valid from date is required" }),
  valid_to: z.string().min(1, { message: "Valid to date is required" }),
  is_active: z.boolean().default(true),
  usage_limit: z.coerce
    .number()
    .int()
    .min(0, { message: "Usage limit must be a positive number" }),
  is_first_order_only: z.boolean().default(false),
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function OffersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      code: "",
      description: "",
      discount_percentage: 10,
      min_order_value: 0,
      max_discount_amount: 0,
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      is_active: true,
      usage_limit: 0,
      is_first_order_only: false,
    },
  });

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchOffers();
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (editingOffer) {
      form.reset({
        code: editingOffer.code,
        description: editingOffer.description,
        discount_percentage: editingOffer.discount_percentage,
        min_order_value: editingOffer.min_order_value,
        max_discount_amount: editingOffer.max_discount_amount,
        valid_from: new Date(editingOffer.valid_from)
          .toISOString()
          .split("T")[0],
        valid_to: new Date(editingOffer.valid_to).toISOString().split("T")[0],
        is_active: editingOffer.is_active,
        usage_limit: editingOffer.usage_limit || 0,
        is_first_order_only: editingOffer.is_first_order_only || false,
      });
      setImagePreview(editingOffer.image || null);
    } else {
      form.reset({
        code: "",
        description: "",
        discount_percentage: 10,
        min_order_value: 0,
        max_discount_amount: 0,
        valid_from: new Date().toISOString().split("T")[0],
        valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        is_active: true,
        usage_limit: 0,
        is_first_order_only: false,
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editingOffer, form]);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview && !editingOffer?.image) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    } else if (editingOffer) {
      // If we're editing and want to remove the existing image
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = editingOffer?.image || null;

      if (imageFile) {
        setIsUploading(true);
        try {
          const fileName = `${Date.now()}-${imageFile.name.replace(
            /\s+/g,
            "-"
          )}`;
          imageUrl = await uploadOfferImage(imageFile, fileName);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Image upload failed",
            description: "Failed to upload offer image",
            variant: "destructive",
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      } else if (imagePreview === null && editingOffer?.image) {
        // User removed the image
        imageUrl = null;
      }

      const offerData = {
        ...data,
        image: imageUrl,
        code: data.code.toUpperCase(),
      };

      if (editingOffer) {
        // Update existing offer
        const { error } = await supabase
          .from("offers")
          .update(offerData)
          .eq("id", editingOffer.id);

        if (error) throw error;

        toast({
          title: "Offer updated",
          description: `${data.code} has been updated successfully`,
        });
      } else {
        // Create new offer
        const { error } = await supabase.from("offers").insert([offerData]);

        if (error) throw error;

        toast({
          title: "Offer created",
          description: `${data.code} has been created successfully`,
        });
      }

      setIsDialogOpen(false);
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast({
        title: "Failed to save offer",
        description: "An error occurred while saving the offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("offers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Offer deleted",
        description: "The offer has been deleted successfully",
      });

      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Failed to delete offer",
        description: "An error occurred while deleting the offer",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingOffer(null);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>You don&apos;t have permission to access this page.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Offers & Coupons</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Offers</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingOffer ? "Edit Offer" : "Add New Offer"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingOffer
                      ? "Update the details of this offer"
                      : "Create a new discount offer or coupon code"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coupon Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., WELCOME10"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Code that customers will enter at checkout
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="e.g., Get 10% off on your first order"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="discount_percentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="max_discount_amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Discount (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormDescription>
                                  0 for no limit
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="min_order_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Order Value (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormDescription>
                                Minimum cart value required to use this offer
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="valid_from"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valid From</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="valid_to"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valid To</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="usage_limit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usage Limit</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} />
                              </FormControl>
                              <FormDescription>
                                0 for unlimited usage
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>
                                    Enable this offer for customers
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="is_first_order_only"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>First Order Only</FormLabel>
                                  <FormDescription>
                                    Limit this offer to first-time customers
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <FormLabel>Offer Image (Optional)</FormLabel>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            {imagePreview ? (
                              <div className="relative">
                                <Image
                                  src={imagePreview || "/placeholder.svg"}
                                  alt="Offer preview"
                                  width={200}
                                  height={100}
                                  className="mx-auto object-contain h-[100px]"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-0 right-0 h-6 w-6"
                                  onClick={removeImage}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="py-4">
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG or WEBP (max. 5MB)
                                </p>
                              </div>
                            )}
                            <div className="mt-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="offer-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById("offer-image")
                                    ?.click()
                                }
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  "Select Image"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingOffer ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>{editingOffer ? "Update Offer" : "Add Offer"}</>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">No offers found</h3>
              <p className="text-muted-foreground mb-4">
                Add your first offer to attract more customers.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Offer
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">
                        {offer.code}
                      </TableCell>
                      <TableCell>
                        {offer.discount_percentage}%
                        {offer.max_discount_amount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            (Max ₹{offer.max_discount_amount})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {offer.min_order_value > 0
                          ? `₹${offer.min_order_value}`
                          : "None"}
                      </TableCell>
                      <TableCell>
                        {formatDate(offer.valid_from)} -{" "}
                        {formatDate(offer.valid_to)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            offer.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {offer.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(offer)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the offer code{" "}
                                {offer.code}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(offer.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
