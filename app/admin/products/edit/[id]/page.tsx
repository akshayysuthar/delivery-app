"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, ArrowLeft, Upload, X } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  supabase,
  fetchCategories,
  uploadProductImage,
} from "@/lib/supabase-client";
import Link from "next/link";

const productFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  sale_price: z.coerce
    .number()
    .nonnegative({ message: "Sale price must be a non-negative number" })
    .optional(),
  category_id: z.string().min(1, { message: "Please select a category" }),
  stock_quantity: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Stock quantity must be a non-negative integer" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  in_stock: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      sale_price: undefined,
      category_id: "",
      stock_quantity: 0,
      unit: "item",
      in_stock: true,
      is_featured: false,
    },
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, router, id]);

  const fetchData = async () => {
    setIsFetchingData(true);

    try {
      // Fetch product data
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      if (!product) {
        toast({
          title: "Product not found",
          description: "The requested product could not be found",
          variant: "destructive",
        });
        router.push("/admin/products");
        return;
      }

      // Set form values
      form.reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        sale_price: product.sale_price || undefined,
        category_id: product.category_id,
        stock_quantity: product.stock_quantity,
        unit: product.unit,
        in_stock: product.in_stock,
        is_featured: product.is_featured || false,
      });

      // Set current image
      setCurrentImage(product.image);

      // Fetch categories
      const categories = await fetchCategories();
      setCategories(categories);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Failed to load product data",
        variant: "destructive",
      });
      router.push("/admin/products");
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
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
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);

    try {
      let imageUrl = currentImage;

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true);

        try {
          const fileName = `${Date.now()}-${imageFile.name.replace(
            /\s+/g,
            "-"
          )}`;
          imageUrl = await uploadProductImage(imageFile, fileName);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Image upload failed",
            description: "Failed to upload product image",
            variant: "destructive",
          });
          setIsLoading(false);
          setIsUploading(false);
          return;
        }

        setIsUploading(false);
      }

      // Update product
      const productData = {
        ...data,
        sale_price: data.sale_price || null,
        image: imageUrl,
      };

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Product updated",
        description: `${data.name} has been updated successfully`,
      });

      // Redirect to products page
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Failed to update product",
        description: "An error occurred while updating the product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  if (isFetchingData) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            className="min-h-[120px]"
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
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sale_price"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Sale Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={value === undefined ? "" : value}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChange(
                                  val === ""
                                    ? undefined
                                    : Number.parseFloat(val)
                                );
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty for no sale price
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="item">Item</SelectItem>
                              <SelectItem value="kg">Kilogram (kg)</SelectItem>
                              <SelectItem value="g">Gram (g)</SelectItem>
                              <SelectItem value="l">Liter (l)</SelectItem>
                              <SelectItem value="ml">
                                Milliliter (ml)
                              </SelectItem>
                              <SelectItem value="dozen">Dozen</SelectItem>
                              <SelectItem value="pack">Pack</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="bottle">Bottle</SelectItem>
                              <SelectItem value="piece">Piece</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormLabel>Product Image</FormLabel>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Product preview"
                            width={200}
                            height={200}
                            className="mx-auto object-contain h-[200px]"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 h-8 w-8"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : currentImage ? (
                        <div className="relative">
                          <Image
                            src={currentImage || "/placeholder.svg"}
                            alt="Current product image"
                            width={200}
                            height={200}
                            className="mx-auto object-contain h-[200px]"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Current image
                          </p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG or WEBP (max. 5MB)
                          </p>
                        </div>
                      )}
                      <div className="mt-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="product-image"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("product-image")?.click()
                          }
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Change Image"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="in_stock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              In Stock
                            </FormLabel>
                            <FormDescription>
                              Mark this product as available for purchase
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
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Featured Product
                            </FormLabel>
                            <FormDescription>
                              Show this product in featured sections
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
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Product...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Product
                    </>
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
