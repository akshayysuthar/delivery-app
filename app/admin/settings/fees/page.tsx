"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Edit, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { AdminNav } from "@/components/admin/admin-nav";
import { supabase } from "@/lib/supabase-client";
import { siteConfig } from "@/config/site";

const feeFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Fee name must be at least 2 characters" }),
  description: z.string().optional(),
  fee_type: z.enum(["fixed", "percentage"]),
  fee_value: z.coerce
    .number()
    .positive({ message: "Fee value must be a positive number" }),
  min_order_value: z.coerce
    .number()
    .nonnegative({
      message: "Minimum order value must be a non-negative number",
    }),
  max_fee_value: z.coerce
    .number()
    .nonnegative({ message: "Maximum fee value must be a non-negative number" })
    .optional(),
  is_active: z.boolean().default(true),
});

type FeeFormValues = z.infer<typeof feeFormSchema>;

export default function AdminFeesPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<any>(null);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      fee_type: "fixed",
      fee_value: 0,
      min_order_value: 0,
      max_fee_value: undefined,
      is_active: true,
    },
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchFees();
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (editingFee) {
      form.reset({
        name: editingFee.name,
        description: editingFee.description || "",
        fee_type: editingFee.fee_type,
        fee_value: editingFee.fee_value,
        min_order_value: editingFee.min_order_value,
        max_fee_value: editingFee.max_fee_value || undefined,
        is_active: editingFee.is_active,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        fee_type: "fixed",
        fee_value: 0,
        min_order_value: 0,
        max_fee_value: undefined,
        is_active: true,
      });
    }
  }, [editingFee, form]);

  const fetchFees = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      setFees(data || []);
    } catch (error) {
      console.error("Error fetching fees:", error);
      toast({
        title: "Failed to load fees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FeeFormValues) => {
    setIsSaving(true);

    try {
      const feeData = {
        ...data,
        description: data.description || null,
        max_fee_value: data.max_fee_value || null,
      };

      if (editingFee) {
        // Update existing fee
        const { error } = await supabase
          .from("fees")
          .update(feeData)
          .eq("id", editingFee.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Fee updated",
          description: `${data.name} has been updated successfully`,
        });

        // Update local state
        setFees(
          fees.map((fee) =>
            fee.id === editingFee.id ? { ...fee, ...feeData } : fee
          )
        );
      } else {
        // Create new fee
        const { data: newFee, error } = await supabase
          .from("fees")
          .insert([feeData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: "Fee created",
          description: `${data.name} has been created successfully`,
        });

        // Update local state
        setFees([...fees, newFee]);
      }

      // Reset form and close dialog
      form.reset();
      setEditingFee(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving fee:", error);
      toast({
        title: "Failed to save fee",
        description: "An error occurred while saving the fee",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!feeToDelete) return;

    try {
      const { error } = await supabase
        .from("fees")
        .delete()
        .eq("id", feeToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Fee deleted",
        description: `${feeToDelete.name} has been deleted successfully`,
      });

      // Update local state
      setFees(fees.filter((fee) => fee.id !== feeToDelete.id));
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast({
        title: "Failed to delete fee",
        description: "An error occurred while deleting the fee",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setFeeToDelete(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Manage Fees</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Additional Charges & Fees</h2>
            <Button
              onClick={() => {
                setEditingFee(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : fees.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Min Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-muted/50">
                      <td className="px-4 py-4">
                        <div className="font-medium">{fee.name}</div>
                        {fee.description && (
                          <div className="text-sm text-muted-foreground">
                            {fee.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="capitalize">{fee.fee_type}</div>
                      </td>
                      <td className="px-4 py-4">
                        {fee.fee_type === "fixed" ? (
                          <div>
                            {siteConfig.currency}
                            {fee.fee_value.toFixed(2)}
                          </div>
                        ) : (
                          <div>
                            {fee.fee_value}%
                            {fee.max_fee_value && (
                              <span className="text-sm text-muted-foreground ml-1">
                                (Max: {siteConfig.currency}
                                {fee.max_fee_value.toFixed(2)})
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {fee.min_order_value > 0 ? (
                          <div>
                            {siteConfig.currency}
                            {fee.min_order_value.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">None</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            fee.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {fee.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFee(fee);
                              setIsDialogOpen(true);
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
                              setFeeToDelete(fee);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-muted-foreground mb-4">
                No fees found. Add your first fee to get started.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fee Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Fee" : "Add New Fee"}</DialogTitle>
            <DialogDescription>
              {editingFee
                ? "Update the details for this fee"
                : "Create a new fee or charge for your orders"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Packaging Fee" {...field} />
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
                        placeholder="e.g. Fee for eco-friendly packaging"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("fee_type") === "fixed"
                          ? `Fee Amount (${siteConfig.currency})`
                          : "Percentage (%)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={
                            form.watch("fee_type") === "fixed" ? "0.01" : "0.1"
                          }
                          min="0"
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
                      <FormLabel>
                        Minimum Order Value ({siteConfig.currency})
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Only apply fee if order value is above this amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("fee_type") === "percentage" && (
                  <FormField
                    control={form.control}
                    name="max_fee_value"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          Maximum Fee Amount ({siteConfig.currency})
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={value === undefined ? "" : value}
                            onChange={(e) => {
                              const val = e.target.value;
                              onChange(
                                val === "" ? undefined : Number.parseFloat(val)
                              );
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Cap the maximum fee amount (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Enable or disable this fee
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                    setEditingFee(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingFee ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the fee &quot;{feeToDelete?.name}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFee}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
