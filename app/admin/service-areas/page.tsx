"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
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
import { supabase } from "@/lib/supabase-client";

const serviceAreaSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  pincode: z
    .string()
    .min(5, { message: "Pincode must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  state: z.string().min(2, { message: "State must be at least 2 characters" }),
  delivery_fee: z.coerce
    .number()
    .min(0, { message: "Delivery fee must be a positive number" }),
  min_order_value: z.coerce
    .number()
    .min(0, { message: "Minimum order value must be a positive number" }),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

type ServiceAreaFormValues = z.infer<typeof serviceAreaSchema>;

export default function ServiceAreasPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [serviceAreas, setServiceAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<any | null>(null);

  const form = useForm<ServiceAreaFormValues>({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: {
      name: "",
      pincode: "",
      city: "",
      state: "",
      delivery_fee: 0,
      min_order_value: 0,
      is_active: true,
      notes: "",
    },
  });

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchServiceAreas();
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (editingArea) {
      form.reset({
        name: editingArea.name,
        pincode: editingArea.pincode,
        city: editingArea.city,
        state: editingArea.state,
        delivery_fee: editingArea.delivery_fee,
        min_order_value: editingArea.min_order_value,
        is_active: editingArea.is_active,
        notes: editingArea.notes || "",
      });
    } else {
      form.reset({
        name: "",
        pincode: "",
        city: "",
        state: "",
        delivery_fee: 0,
        min_order_value: 0,
        is_active: true,
        notes: "",
      });
    }
  }, [editingArea, form]);

  const fetchServiceAreas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_areas")
        .select("*")
        .order("name");

      if (error) throw error;
      setServiceAreas(data || []);
    } catch (error) {
      console.error("Error fetching service areas:", error);
      toast({
        title: "Failed to load service areas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ServiceAreaFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingArea) {
        // Update existing service area
        const { error } = await supabase
          .from("service_areas")
          .update(data)
          .eq("id", editingArea.id);

        if (error) throw error;

        toast({
          title: "Service area updated",
          description: `${data.name} has been updated successfully`,
        });
      } else {
        // Create new service area
        const { error } = await supabase.from("service_areas").insert([data]);

        if (error) throw error;

        toast({
          title: "Service area created",
          description: `${data.name} has been created successfully`,
        });
      }

      setIsDialogOpen(false);
      fetchServiceAreas();
    } catch (error) {
      console.error("Error saving service area:", error);
      toast({
        title: "Failed to save service area",
        description: "An error occurred while saving the service area",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("service_areas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Service area deleted",
        description: "The service area has been deleted successfully",
      });

      fetchServiceAreas();
    } catch (error) {
      console.error("Error deleting service area:", error);
      toast({
        title: "Failed to delete service area",
        description: "An error occurred while deleting the service area",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (area: any) => {
    setEditingArea(area);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingArea(null);
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
        <h1 className="text-2xl font-bold">Service Areas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Service Areas</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Area
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingArea ? "Edit Service Area" : "Add New Service Area"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingArea
                      ? "Update the details of this service area"
                      : "Add a new area where you provide delivery service"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Adajan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 395009" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Surat" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Gujarat" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="delivery_fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Fee (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="min_order_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Order Value (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                {...field}
                              />
                            </FormControl>
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
                                Enable delivery in this area
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
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional information about this area"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingArea ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>{editingArea ? "Update Area" : "Add Area"}</>
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
          ) : serviceAreas.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">
                No service areas found
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first service area to start delivering in that
                location.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service Area
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area Name</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Delivery Fee</TableHead>
                    <TableHead>Min. Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{area.pincode}</TableCell>
                      <TableCell>{area.city}</TableCell>
                      <TableCell>₹{area.delivery_fee}</TableCell>
                      <TableCell>₹{area.min_order_value}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            area.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {area.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(area)}
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
                              <AlertDialogTitle>
                                Delete Service Area
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {area.name}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(area.id)}
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
