"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Edit, Trash2, Loader2, Upload, X, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { AdminNav } from "@/components/admin/admin-nav"
import { supabase, uploadProductImage } from "@/lib/supabase-client"

const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

export default function AdminCategoriesPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  })

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push("/")
    } else if (user && isAdmin) {
      fetchCategories()
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        slug: editingCategory.slug,
      })
      setImagePreview(editingCategory.image)
    } else {
      form.reset({
        name: "",
        slug: "",
      })
      setImagePreview(null)
      setImageFile(null)
    }
  }, [editingCategory, form])

  const fetchCategories = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview && !editingCategory) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    } else if (editingCategory) {
      // If editing, reset to original image
      setImagePreview(editingCategory.image)
    }
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSaving(true)

    try {
      let imageUrl = editingCategory?.image || null

      // Upload image if selected
      if (imageFile) {
        setIsUploading(true)

        try {
          const fileName = `category-${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`
          imageUrl = await uploadProductImage(imageFile, fileName)
        } catch (error) {
          console.error("Error uploading image:", error)
          toast({
            title: "Image upload failed",
            description: "Failed to upload category image",
            variant: "destructive",
          })
          setIsSaving(false)
          setIsUploading(false)
          return
        }

        setIsUploading(false)
      }

      const categoryData = {
        name: data.name,
        slug: data.slug,
        image: imageUrl,
      }

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase.from("categories").update(categoryData).eq("id", editingCategory.id)

        if (error) {
          throw error
        }

        toast({
          title: "Category updated",
          description: `${data.name} has been updated successfully`,
        })

        // Update local state
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat)))
      } else {
        // Create new category
        const { data: newCategory, error } = await supabase.from("categories").insert([categoryData]).select().single()

        if (error) {
          throw error
        }

        toast({
          title: "Category created",
          description: `${data.name} has been created successfully`,
        })

        // Update local state
        setCategories([...categories, newCategory])
      }

      // Reset form and close dialog
      form.reset()
      setEditingCategory(null)
      setIsDialogOpen(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Failed to save category",
        description: "An error occurred while saving the category",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      // Check if there are products in this category
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryToDelete.id)

      if (countError) {
        throw countError
      }

      if (count && count > 0) {
        toast({
          title: "Cannot delete category",
          description: `This category contains ${count} products. Please reassign or delete them first.`,
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setCategoryToDelete(null)
        return
      }

      const { error } = await supabase.from("categories").delete().eq("id", categoryToDelete.id)

      if (error) {
        throw error
      }

      toast({
        title: "Category deleted",
        description: `${categoryToDelete.name} has been deleted successfully`,
      })

      // Update local state
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id))
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Failed to delete category",
        description: "An error occurred while deleting the category",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue("name", name)

    // Auto-generate slug if not manually edited
    if (!editingCategory || form.getValues("slug") === editingCategory.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")

      form.setValue("slug", slug)
    }
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>You don&apos;t have permission to access this page.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Button
              onClick={() => {
                setEditingCategory(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          setCategoryToDelete(category)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground mb-4">No categories found. Add your first category to get started.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the details for this category" : "Create a new category for your products"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fruits & Vegetables" {...field} onChange={handleNameChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. fruits-vegetables" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Category Image</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        width={200}
                        height={150}
                        className="mx-auto object-cover h-[150px]"
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
                  ) : (
                    <div className="py-4">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 5MB)</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="category-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("category-image")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Select Image"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    form.reset()
                    setEditingCategory(null)
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || isUploading}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingCategory ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &quot;{categoryToDelete?.name}&quot;. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


