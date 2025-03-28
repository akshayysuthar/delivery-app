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
  Eye,
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
import { supabase, uploadBannerImage } from "@/lib/supabase-client";

const bannerSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  link: z.string().optional(),
  cta: z.string().optional(),
  is_active: z.boolean().default(true),
  display_order: z.coerce
    .number()
    .int()
    .min(0, { message: "Display order must be a positive number" }),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function BannersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      cta: "Shop Now",
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchBanners();
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (editingBanner) {
      form.reset({
        title: editingBanner.title,
        description: editingBanner.description || "",
        link: editingBanner.link || "",
        cta: editingBanner.cta || "Shop Now",
        is_active: editingBanner.is_active,
        display_order: editingBanner.display_order || 0,
      });
      setImagePreview(editingBanner.image || null);
    } else {
      form.reset({
        title: "",
        description: "",
        link: "",
        cta: "Shop Now",
        is_active: true,
        display_order: banners.length,
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editingBanner, form, banners.length]);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast({
        title: "Failed to load banners",
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
    if (imagePreview && !editingBanner?.image) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    } else if (editingBanner) {
      // If we're editing and want to remove the existing image
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    setIsSubmitting(true);
    try {
      if (!imageFile && !imagePreview) {
        toast({
          title: "Image required",
          description: "Please upload an image for the banner",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      let imageUrl = editingBanner?.image || null;

      if (imageFile) {
        setIsUploading(true);
        try {
          const fileName = `${Date.now()}-${imageFile.name.replace(
            /\s+/g,
            "-"
          )}`;
          imageUrl = await uploadBannerImage(imageFile, fileName);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Image upload failed",
            description: "Failed to upload banner image",
            variant: "destructive",
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      } else if (imagePreview === null && editingBanner?.image) {
        // User removed the image
        toast({
          title: "Image required",
          description: "Please upload an image for the banner",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const bannerData = {
        ...data,
        image: imageUrl,
      };

      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) throw error;

        toast({
          title: "Banner updated",
          description: `${data.title} has been updated successfully`,
        });
      } else {
        // Create new banner
        const { error } = await supabase.from("banners").insert([bannerData]);

        if (error) throw error;

        toast({
          title: "Banner created",
          description: `${data.title} has been created successfully`,
        });
      }

      setIsDialogOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast({
        title: "Failed to save banner",
        description: "An error occurred while saving the banner",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Banner deleted",
        description: "The banner has been deleted successfully",
      });

      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Failed to delete banner",
        description: "An error occurred while deleting the banner",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    setIsDialogOpen(true);
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
        <h1 className="text-2xl font-bold">Banner Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Banners</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingBanner ? "Edit Banner" : "Add New Banner"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBanner
                      ? "Update the details of this banner"
                      : "Create a new banner for the homepage slider"}
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
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Banner Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Summer Sale"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="e.g., Get up to 50% off on summer essentials"
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
                            name="link"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Link URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., /categories/summer"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Where to send users who click the banner
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CTA Text</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Shop Now"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Text for the call-to-action button
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="display_order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Order</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Lower numbers appear first in the slider
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>
                                    Show this banner on the homepage
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
                          <FormLabel>Banner Image</FormLabel>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            {imagePreview ? (
                              <div className="relative">
                                <Image
                                  src={imagePreview || "/placeholder.svg"}
                                  alt="Banner preview"
                                  width={300}
                                  height={150}
                                  className="mx-auto object-cover h-[150px]"
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
                                <p className="text-xs text-muted-foreground mt-1">
                                  Recommended size: 1200x500 pixels
                                </p>
                              </div>
                            )}
                            <div className="mt-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="banner-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById("banner-image")
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
                            {editingBanner ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>{editingBanner ? "Update Banner" : "Add Banner"}</>
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
          ) : banners.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">No banners found</h3>
              <p className="text-muted-foreground mb-4">
                Add your first banner to showcase on the homepage.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative h-16 w-32 rounded overflow-hidden">
                          <Image
                            src={banner.image || "/placeholder.svg"}
                            alt={banner.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {banner.title}
                      </TableCell>
                      <TableCell>{banner.display_order}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            banner.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {banner.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={banner.link || "#"} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
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
                              <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this banner?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(banner.id)}
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
