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

const deliverySlotSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  start_time: z.string().min(5, { message: "Start time is required" }),
  end_time: z.string().min(5, { message: "End time is required" }),
  max_orders: z.coerce
    .number()
    .int()
    .positive({ message: "Max orders must be a positive number" }),
  is_active: z.boolean().default(true),
  cutoff_time: z.string().min(5, { message: "Cutoff time is required" }),
});

type DeliverySlotFormValues = z.infer<typeof deliverySlotSchema>;

export default function DeliverySlotsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [deliverySlots, setDeliverySlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any | null>(null);

  const form = useForm<DeliverySlotFormValues>({
    resolver: zodResolver(deliverySlotSchema),
    defaultValues: {
      name: "",
      start_time: "",
      end_time: "",
      max_orders: 20,
      is_active: true,
      cutoff_time: "",
    },
  });

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchDeliverySlots();
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (editingSlot) {
      form.reset({
        name: editingSlot.name,
        start_time: editingSlot.start_time,
        end_time: editingSlot.end_time,
        max_orders: editingSlot.max_orders,
        is_active: editingSlot.is_active,
        cutoff_time: editingSlot.cutoff_time || "",
      });
    } else {
      form.reset({
        name: "",
        start_time: "",
        end_time: "",
        max_orders: 20,
        is_active: true,
        cutoff_time: "",
      });
    }
  }, [editingSlot, form]);

  const fetchDeliverySlots = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("delivery_slots")
        .select("*")
        .order("start_time");

      if (error) throw error;
      setDeliverySlots(data || []);
    } catch (error) {
      console.error("Error fetching delivery slots:", error);
      toast({
        title: "Failed to load delivery slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DeliverySlotFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingSlot) {
        // Update existing delivery slot
        const { error } = await supabase
          .from("delivery_slots")
          .update(data)
          .eq("id", editingSlot.id);

        if (error) throw error;

        toast({
          title: "Delivery slot updated",
          description: `${data.name} has been updated successfully`,
        });
      } else {
        // Create new delivery slot
        const { error } = await supabase.from("delivery_slots").insert([data]);

        if (error) throw error;

        toast({
          title: "Delivery slot created",
          description: `${data.name} has been created successfully`,
        });
      }

      setIsDialogOpen(false);
      fetchDeliverySlots();
    } catch (error) {
      console.error("Error saving delivery slot:", error);
      toast({
        title: "Failed to save delivery slot",
        description: "An error occurred while saving the delivery slot",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("delivery_slots")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Delivery slot deleted",
        description: "The delivery slot has been deleted successfully",
      });

      fetchDeliverySlots();
    } catch (error) {
      console.error("Error deleting delivery slot:", error);
      toast({
        title: "Failed to delete delivery slot",
        description: "An error occurred while deleting the delivery slot",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (slot: any) => {
    setEditingSlot(slot);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingSlot(null);
    setIsDialogOpen(true);
  };

  const formatTime = (time: string) => {
    if (!time) return "";

    // Assuming time is in 24-hour format like "14:30"
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
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
        <h1 className="text-2xl font-bold">Delivery Slots</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Delivery Slots</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlot
                      ? "Edit Delivery Slot"
                      : "Add New Delivery Slot"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSlot
                      ? "Update the details of this delivery slot"
                      : "Add a new time slot for delivery"}
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
                          <FormLabel>Slot Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Morning Slot"
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
                        name="start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cutoff_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cutoff Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                              Last time to place an order for this slot
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="max_orders"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Orders</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum orders for this slot
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable this delivery slot for booking
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
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingSlot ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>{editingSlot ? "Update Slot" : "Add Slot"}</>
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
          ) : deliverySlots.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">
                No delivery slots found
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first delivery slot to start accepting orders.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Delivery Slot
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Cutoff Time</TableHead>
                    <TableHead>Max Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliverySlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.name}</TableCell>
                      <TableCell>
                        {formatTime(slot.start_time)} -{" "}
                        {formatTime(slot.end_time)}
                      </TableCell>
                      <TableCell>{formatTime(slot.cutoff_time)}</TableCell>
                      <TableCell>{slot.max_orders}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            slot.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {slot.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(slot)}
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
                                Delete Delivery Slot
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {slot.name}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(slot.id)}
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
