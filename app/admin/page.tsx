"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, ShoppingBag, Users, BarChart, DollarSign, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { AdminNav } from "@/components/admin/admin-nav"
import { siteConfig } from "@/config/site"

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <AdminNav />
        </div>

        <div className="md:col-span-4">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{siteConfig.currency}12,345</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+24 new this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">573</div>
                    <p className="text-xs text-muted-foreground">+201 since last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest 5 orders placed on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground">
                        <div>Order ID</div>
                        <div>Status</div>
                        <div className="text-right">Amount</div>
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="grid grid-cols-3 text-sm">
                            <div className="truncate">ORD-{100000 + i}</div>
                            <div>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                                Delivered
                              </span>
                            </div>
                            <div className="text-right font-medium">
                              {siteConfig.currency}
                              {(Math.random() * 1000).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/admin/orders">View all orders</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Most popular products this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground">
                        <div className="col-span-2">Product</div>
                        <div className="text-right">Units Sold</div>
                      </div>
                      <div className="space-y-2">
                        {[
                          "Fresh Organic Apples",
                          "Whole Wheat Bread",
                          "Farm Fresh Eggs",
                          "Amul Butter",
                          "Tata Salt",
                        ].map((product, i) => (
                          <div key={i} className="grid grid-cols-3 text-sm">
                            <div className="col-span-2 truncate">{product}</div>
                            <div className="text-right font-medium">{Math.floor(Math.random() * 100) + 10}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/admin/products">View all products</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                  <CardDescription>View detailed sales performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics visualization would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and download business reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                        <TrendingUp className="h-8 w-8 mb-2" />
                        <span>Sales Report</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                        <Users className="h-8 w-8 mb-2" />
                        <span>Customer Report</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                        <Package className="h-8 w-8 mb-2" />
                        <span>Inventory Report</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

