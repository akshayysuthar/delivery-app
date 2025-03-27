"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Package,
  Search,
  Filter,
  MoreHorizontal,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  TruckIcon,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { AdminNav } from "@/components/admin/admin-nav";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import { siteConfig } from "@/config/site";

export default function AdminOrdersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isLoadingOrderItems, setIsLoadingOrderItems] = useState(false);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchOrdersData();
      fetchOrderStats();
    }
  }, [
    user,
    isAdmin,
    router,
    currentPage,
    statusFilter,
    dateFilter,
    sortField,
    sortDirection,
  ]);

  const fetchOrdersData = async () => {
    setIsLoading(true);

    try {
      let query = supabase.from("orders").select(
        `
          *,
          profiles:user_id(full_name, email, phone),
          addresses:address_id(*),
          delivery_slots:delivery_slot_id(*, service_areas:service_area_id(name))
        `,
        { count: "exact" }
      );

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply date filter
      if (dateFilter !== "all") {
        const today = new Date();
        let startDate;

        switch (dateFilter) {
          case "today":
            startDate = new Date(today.setHours(0, 0, 0, 0));
            query = query.gte("created_at", startDate.toISOString());
            break;
          case "yesterday":
            startDate = new Date(today.setHours(0, 0, 0, 0));
            startDate.setDate(startDate.getDate() - 1);
            const endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            query = query
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());
            break;
          case "last7days":
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 7);
            query = query.gte("created_at", startDate.toISOString());
            break;
          case "last30days":
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 30);
            query = query.gte("created_at", startDate.toISOString());
            break;
        }
      }

      // Apply search filter if present
      if (searchQuery.trim()) {
        // Search by order ID or customer name/email
        query = query.or(
          `id.ilike.%${searchQuery}%,profiles.full_name.ilike.%${searchQuery}%,profiles.email.ilike.%${searchQuery}%`
        );
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) {
        throw error;
      }

      setOrders(data || []);

      // Calculate total pages
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      // Get total orders count
      const { count: totalCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Get counts by status
      const statuses = [
        "pending",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];
      const statusCounts = await Promise.all(
        statuses.map(async (status) => {
          const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", status);
          return { status, count };
        })
      );

      const stats = {
        pending: 0,
        processing: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
        total: totalCount || 0,
      };

      statusCounts.forEach(({ status, count }) => {
        if (count) {
          stats[status as keyof typeof stats] = count;
        }
      });

      setOrderStats(stats);
    } catch (error) {
      console.error("Error fetching order stats:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrdersData();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);

    // Fetch order items
    setIsLoadingOrderItems(true);
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          products:product_id(*)
        `
        )
        .eq("order_id", order.id);

      if (error) {
        throw error;
      }

      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast({
        title: "Failed to load order items",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrderItems(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdatingStatus(true);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);

      if (error) {
        throw error;
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Update selected order
      setSelectedOrder({ ...selectedOrder, status: newStatus });

      // Update order stats
      fetchOrderStats();

      toast({
        title: "Order status updated",
        description: `Order #${selectedOrder.id.substring(
          0,
          8
        )} status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setIsStatusDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "out_for_delivery":
        return "secondary";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
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
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          {/* Order Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{orderStats.pending}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Processing
                </p>
                <p className="text-2xl font-bold">{orderStats.processing}</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-100">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Out for Delivery
                </p>
                <p className="text-2xl font-bold">
                  {orderStats.out_for_delivery}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-100">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Delivered
                </p>
                <p className="text-2xl font-bold">{orderStats.delivered}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-100">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Cancelled
                </p>
                <p className="text-2xl font-bold">{orderStats.cancelled}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="out_for_delivery">
                    Out for Delivery
                  </SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <button
                        className="flex items-center"
                        onClick={() => handleSort("id")}
                      >
                        Order ID
                        {sortField === "id" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <button
                        className="flex items-center"
                        onClick={() => handleSort("profiles.full_name")}
                      >
                        Customer
                        {sortField === "profiles.full_name" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <button
                        className="flex items-center"
                        onClick={() => handleSort("created_at")}
                      >
                        Date
                        {sortField === "created_at" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <button
                        className="flex items-center"
                        onClick={() => handleSort("total_amount")}
                      >
                        Amount
                        {sortField === "total_amount" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
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
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <div className="font-medium">#{order.id}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {order.profiles?.full_name || "Guest"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.profiles?.email || "No email"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>{formatDate(order.created_at)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {siteConfig.currency}
                            {order.total_amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.payment_method === "cod"
                              ? "Cash on Delivery"
                              : order.payment_method === "card"
                              ? "Card"
                              : "UPI"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {
                              order.status.replace(/_/g, " ")
                              // .replace(/\b\w/g, (l) => l.toUpperCase())
                            }
                          </Badge>
                          <div className="mt-1">
                            <Badge
                              variant={getPaymentStatusBadgeVariant(
                                order.payment_status
                              )}
                              className="text-xs"
                            >
                              {order.payment_status.charAt(0).toUpperCase() +
                                order.payment_status.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                  setIsStatusDialogOpen(true);
                                }}
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No orders found. Try adjusting your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      orders.length + (currentPage - 1) * itemsPerPage
                    )}
                  </span>{" "}
                  of many results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id} -{" "}
              {formatDate(selectedOrder?.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Customer Information
                  </h3>
                  <div className="border rounded-md p-3">
                    <p className="font-medium">
                      {selectedOrder.profiles?.full_name || "Guest"}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.profiles?.email || "No email"}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.profiles?.phone || "No phone"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Delivery Information
                  </h3>
                  <div className="border rounded-md p-3">
                    {selectedOrder.addresses ? (
                      <>
                        <p className="font-medium">
                          {selectedOrder.addresses.address_line2?.split(
                            ":"
                          )[0] || "Address"}
                        </p>
                        <p className="text-sm">
                          {selectedOrder.addresses.address_line1}
                        </p>
                        <p className="text-sm">
                          {selectedOrder.addresses.address_line2
                            ?.split(":")[1]
                            ?.trim()}
                        </p>
                        {selectedOrder.addresses.landmark && (
                          <p className="text-sm">
                            Landmark: {selectedOrder.addresses.landmark}
                          </p>
                        )}
                        <p className="text-sm">
                          {selectedOrder.addresses.city},{" "}
                          {selectedOrder.addresses.state} -{" "}
                          {selectedOrder.addresses.pincode}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No address information
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Order Status
                  </h3>
                  <div className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Status</p>
                      <Badge
                        variant={getStatusBadgeVariant(selectedOrder.status)}
                      >
                        {
                          selectedOrder.status.replace(/_/g, " ")
                          // .replace(/\b\w/g, (l) => l.toUpperCase())
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-medium">Payment</p>
                      <Badge
                        variant={getPaymentStatusBadgeVariant(
                          selectedOrder.payment_status
                        )}
                      >
                        {selectedOrder.payment_status.charAt(0).toUpperCase() +
                          selectedOrder.payment_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm">
                        {selectedOrder.payment_method === "cod"
                          ? "Cash on Delivery"
                          : selectedOrder.payment_method === "card"
                          ? "Credit/Debit Card"
                          : "UPI"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Delivery Slot
                  </h3>
                  <div className="border rounded-md p-3">
                    {selectedOrder.delivery_slots ? (
                      <>
                        <p className="font-medium">
                          {selectedOrder.delivery_slots.service_areas?.name ||
                            "Unknown Area"}
                        </p>
                        <p className="text-sm">
                          {selectedOrder.delivery_date
                            ? format(
                                new Date(selectedOrder.delivery_date),
                                "EEEE, MMMM d, yyyy"
                              )
                            : "No date"}
                        </p>
                        <p className="text-sm">
                          {selectedOrder.delivery_slots.start_time?.substring(
                            0,
                            5
                          )}{" "}
                          -{" "}
                          {selectedOrder.delivery_slots.end_time?.substring(
                            0,
                            5
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No delivery slot information
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Order Items
                </h3>
                <div className="border rounded-md overflow-hidden">
                  {isLoadingOrderItems ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : orderItems.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Price
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                {item.products?.name || "Unknown Product"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {siteConfig.currency}
                              {item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">
                              {siteConfig.currency}
                              {(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-center text-muted-foreground">
                      No items found for this order
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {siteConfig.currency}
                      {(selectedOrder.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.coupon_discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Coupon Discount
                      </span>
                      <span className="text-green-600">
                        -{siteConfig.currency}
                        {selectedOrder.coupon_discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>
                      {selectedOrder.delivery_fee === 0
                        ? "Free"
                        : `${
                            siteConfig.currency
                          }${selectedOrder.delivery_fee.toFixed(2)}`}
                    </span>
                  </div>
                  {selectedOrder.platform_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Platform Fee
                      </span>
                      <span>
                        {siteConfig.currency}
                        {selectedOrder.platform_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.handling_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Handling Fee
                      </span>
                      <span>
                        {siteConfig.currency}
                        {selectedOrder.handling_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.packaging_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Packaging Fee
                      </span>
                      <span>
                        {siteConfig.currency}
                        {selectedOrder.packaging_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>
                        {siteConfig.currency}
                        {selectedOrder.tax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {siteConfig.currency}
                      {selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Order Notes
                  </h3>
                  <div className="border rounded-md p-3">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsStatusDialogOpen(true);
                setNewStatus(selectedOrder?.status || "");
              }}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="processing">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-blue-500" />
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value="out_for_delivery">
                    <div className="flex items-center">
                      <TruckIcon className="h-4 w-4 mr-2 text-orange-500" />
                      Out for Delivery
                    </div>
                  </SelectItem>
                  <SelectItem value="delivered">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Delivered
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                !newStatus ||
                newStatus === selectedOrder?.status ||
                isUpdatingStatus
              }
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
