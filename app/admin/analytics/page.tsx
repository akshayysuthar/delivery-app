"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { AdminNav } from "@/components/admin/admin-nav";
import { supabase } from "@/lib/supabase-client";
import { siteConfig } from "@/config/site";

// Define TypeScript interfaces for data structures
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

interface CategoryProduct {
  category_id: string;
  categories: { name: string };
}

interface CategoryOrderItem {
  quantity: number;
  products: CategoryProduct | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
}

interface ProductOrderItem {
  quantity: number;
  products: Product | null;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number; // Fixed typo from customers_Fchange
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function AdminAnalyticsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("last30days");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0, // Consistent naming
  });

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchAnalyticsData();
    }
  }, [user, isAdmin, router, timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);

    try {
      const { startDate, endDate, previousStartDate, previousEndDate } =
        getDateRange(timeRange);

      await fetchSalesData(startDate, endDate);
      await fetchCategoryData(startDate, endDate);
      await fetchTopProductsData(startDate, endDate);
      await fetchStatsWithComparison(
        startDate,
        endDate,
        previousStartDate,
        previousEndDate
      );
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const today = new Date();
    let startDate, endDate, previousStartDate, previousEndDate;

    switch (range) {
      case "last7days":
        startDate = format(subDays(today, 7), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        previousStartDate = format(subDays(today, 14), "yyyy-MM-dd");
        previousEndDate = format(subDays(today, 8), "yyyy-MM-dd");
        break;
      case "last30days":
        startDate = format(subDays(today, 30), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        previousStartDate = format(subDays(today, 60), "yyyy-MM-dd");
        previousEndDate = format(subDays(today, 31), "yyyy-MM-dd");
        break;
      case "thisMonth":
        startDate = format(startOfMonth(today), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1);
        previousStartDate = format(startOfMonth(prevMonth), "yyyy-MM-dd");
        previousEndDate = format(endOfMonth(prevMonth), "yyyy-MM-dd");
        break;
      case "thisYear":
        startDate = format(startOfYear(today), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        const prevYear = new Date(today.getFullYear() - 1, 0);
        previousStartDate = format(startOfYear(prevYear), "yyyy-MM-dd");
        previousEndDate = format(endOfYear(prevYear), "yyyy-MM-dd");
        break;
      default:
        startDate = format(subDays(today, 30), "yyyy-MM-dd");
        endDate = format(today, "yyyy-MM-dd");
        previousStartDate = format(subDays(today, 60), "yyyy-MM-dd");
        previousEndDate = format(subDays(today, 31), "yyyy-MM-dd");
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
  };

  const fetchSalesData = async (startDate: string, endDate: string) => {
    try {
      if (timeRange === "last7days" || timeRange === "last30days") {
        const { data, error } = (await supabase
          .from("orders")
          .select("created_at, total_amount, status")
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`)
          .order("created_at")) as { data: Order[] | null; error: any };

        if (error) throw error;

        const groupedData: Record<
          string,
          { date: string; revenue: number; orders: number }
        > = {};

        data?.forEach((order) => {
          const date = format(new Date(order.created_at), "yyyy-MM-dd");
          if (!groupedData[date]) {
            groupedData[date] = { date, revenue: 0, orders: 0 };
          }
          if (order.status !== "cancelled") {
            groupedData[date].revenue += order.total_amount;
            groupedData[date].orders += 1;
          }
        });

        const result = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
          const dateStr = format(currentDate, "yyyy-MM-dd");
          if (groupedData[dateStr]) {
            result.push(groupedData[dateStr]);
          } else {
            result.push({ date: dateStr, revenue: 0, orders: 0 });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const formattedResult = result.map((item) => ({
          ...item,
          date: format(new Date(item.date), "MMM dd"),
        }));

        setSalesData(formattedResult);
      } else {
        const { data, error } = (await supabase
          .from("orders")
          .select("created_at, total_amount, status")
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`)
          .order("created_at")) as { data: Order[] | null; error: any };

        if (error) throw error;

        const groupedData: Record<
          string,
          { date: string; revenue: number; orders: number }
        > = {};

        data?.forEach((order) => {
          const date = format(
            new Date(order.created_at),
            timeRange === "thisYear" ? "yyyy-MM" : "yyyy-MM-dd"
          );
          if (!groupedData[date]) {
            groupedData[date] = { date, revenue: 0, orders: 0 };
          }
          if (order.status !== "cancelled") {
            groupedData[date].revenue += order.total_amount;
            groupedData[date].orders += 1;
          }
        });

        const result = Object.values(groupedData).sort((a, b) =>
          a.date.localeCompare(b.date)
        );

        const formattedResult = result.map((item) => ({
          ...item,
          date: format(
            new Date(timeRange === "thisYear" ? `${item.date}-01` : item.date),
            timeRange === "thisYear" ? "MMM" : "MMM dd"
          ),
        }));

        setSalesData(formattedResult);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const fetchCategoryData = async (startDate: string, endDate: string) => {
    try {
      const { data: orders, error: ordersError } = (await supabase
        .from("orders")
        .select("id, status")
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)
        .not("status", "eq", "cancelled")) as {
        data: Order[] | null;
        error: any;
      };

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setCategoryData([]);
        return;
      }

      const orderIds = orders.map((order) => order.id);

      const { data: orderItems, error: itemsError } = (await supabase
        .from("order_items")
        .select(
          `
          quantity, 
          products:product_id(
            category_id, 
            categories:category_id(name)
          )
        `
        )
        .in("order_id", orderIds)) as {
        data: CategoryOrderItem[] | null;
        error: any;
      };

      if (itemsError) throw itemsError;

      const categoryMap: Record<string, { name: string; value: number }> = {};

      orderItems?.forEach((item) => {
        const categoryId = item.products?.category_id ?? "uncategorized";
        const categoryName = item.products?.categories?.name || "Uncategorized";

        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = { name: categoryName, value: 0 };
        }

        categoryMap[categoryId].value += item.quantity;
      });

      const result = Object.values(categoryMap).sort(
        (a, b) => b.value - a.value
      );
      setCategoryData(result);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const fetchTopProductsData = async (startDate: string, endDate: string) => {
    try {
      const { data: orders, error: ordersError } = (await supabase
        .from("orders")
        .select("id, status")
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)
        .not("status", "eq", "cancelled")) as {
        data: Order[] | null;
        error: any;
      };

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setProductData([]);
        return;
      }

      const orderIds = orders.map((order) => order.id);

      const { data: orderItems, error: itemsError } = (await supabase
        .from("order_items")
        .select(
          `
          quantity, 
          products:product_id(
            id, name, price, sale_price
          )
        `
        )
        .in("order_id", orderIds)) as {
        data: ProductOrderItem[] | null;
        error: any;
      };

      if (itemsError) throw itemsError;

      const productMap: Record<
        string,
        { name: string; quantity: number; revenue: number }
      > = {};

      orderItems?.forEach((item) => {
        const productId = item.products?.id ?? "unknown";
        const productName = item.products?.name || "Unknown Product";
        const price = item.products?.sale_price ?? item.products?.price ?? 0;

        if (!productMap[productId]) {
          productMap[productId] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        productMap[productId].quantity += item.quantity;
        productMap[productId].revenue += price * item.quantity;
      });

      const result = Object.values(productMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
      setProductData(result);
    } catch (error) {
      console.error("Error fetching top products data:", error);
    }
  };

  const fetchStatsWithComparison = async (
    startDate: string,
    endDate: string,
    previousStartDate: string,
    previousEndDate: string
  ) => {
    try {
      const { data: currentOrders, error: currentError } = (await supabase
        .from("orders")
        .select("total_amount, status")
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59}`)) as {
        data: Order[] | null;
        error: any;
      };

      if (currentError) throw currentError;

      const { data: previousOrders, error: previousError } = (await supabase
        .from("orders")
        .select("total_amount, status")
        .gte("created_at", `${previousStartDate}T00:00:00`)
        .lte("created_at", `${previousEndDate}T23:59:59}`)) as {
        data: Order[] | null;
        error: any;
      };

      if (previousError) throw previousError;

      const currentRevenue =
        currentOrders
          ?.filter((order) => order.status !== "cancelled")
          .reduce((sum, order) => sum + order.total_amount, 0) || 0;

      const previousRevenue =
        previousOrders
          ?.filter((order) => order.status !== "cancelled")
          .reduce((sum, order) => sum + order.total_amount, 0) || 0;

      const currentOrderCount =
        currentOrders?.filter((order) => order.status !== "cancelled").length ||
        0;
      const previousOrderCount =
        previousOrders?.filter((order) => order.status !== "cancelled")
          .length || 0;

      const { count: currentCustomersCount, error: currentCustomersError } =
        await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59}`);

      if (currentCustomersError) throw currentCustomersError;

      const { count: previousCustomersCount, error: previousCustomersError } =
        await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", `${previousStartDate}T00:00:00`)
          .lte("created_at", `${previousEndDate}T23:59:59}`);

      if (previousCustomersError) throw previousCustomersError;

      const { count: productCount, error: productError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });

      if (productError) throw productError;

      const revenueChange =
        previousRevenue === 0
          ? 100
          : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

      const ordersChange =
        previousOrderCount === 0
          ? 100
          : ((currentOrderCount - previousOrderCount) / previousOrderCount) *
            100;

      const customersChange =
        (previousCustomersCount ?? 0) === 0
          ? 100
          : (((currentCustomersCount ?? 0) - (previousCustomersCount ?? 0)) /
              (previousCustomersCount ?? 0)) *
            100;

      setStats({
        totalRevenue: currentRevenue,
        totalOrders: currentOrderCount,
        totalCustomers: currentCustomersCount ?? 0,
        totalProducts: productCount ?? 0,
        revenueChange,
        ordersChange,
        customersChange,
      });
    } catch (error) {
      console.error("Error fetching stats with comparison:", error);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>You don't have permission to access this page.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Sales Analytics</h2>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {siteConfig.currency}
                      {stats.totalRevenue.toFixed(2)}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      {stats.revenueChange >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                      )}
                      <span
                        className={
                          stats.revenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {Math.abs(stats.revenueChange).toFixed(1)}% from
                        previous period
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalOrders}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      {stats.ordersChange >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                      )}
                      <span
                        className={
                          stats.ordersChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {Math.abs(stats.ordersChange).toFixed(1)}% from previous
                        period
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      New Customers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalCustomers}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      {stats.customersChange >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
                      )}
                      <span
                        className={
                          stats.customersChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {Math.abs(stats.customersChange).toFixed(1)}% from
                        previous period
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalProducts}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Active products in catalog
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="revenue" className="mb-6">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="revenue" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Over Time</CardTitle>
                      <CardDescription>
                        Total revenue for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={salesData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                              tickFormatter={(value) =>
                                `${siteConfig.currency}${value}`
                              }
                            />
                            <Tooltip
                              formatter={(value) => [
                                `${siteConfig.currency}${value}`,
                                "Revenue",
                              ]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Bar
                              dataKey="revenue"
                              fill="#8884d8"
                              name="Revenue"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="orders" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Orders Over Time</CardTitle>
                      <CardDescription>
                        Number of orders for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={salesData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => [value, "Orders"]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Bar
                              dataKey="orders"
                              fill="#82ca9d"
                              name="Orders"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>
                      Distribution of sales across product categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                              }
                            >
                              {categoryData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [value, "Units Sold"]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">
                            No category data available
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>
                      Products with the highest sales volume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {productData.length > 0 ? (
                      <div className="space-y-4">
                        {productData.slice(0, 5).map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full mr-3">
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.quantity} units •{" "}
                                  {siteConfig.currency}
                                  {product.revenue.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {siteConfig.currency}
                                {(product.revenue / product.quantity).toFixed(
                                  2
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                per unit
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-muted-foreground">
                          No product data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
