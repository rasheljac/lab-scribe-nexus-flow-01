
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, ShoppingCart, Calendar, DollarSign, Truck, Package } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const orders = [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    supplier: "Fisher Scientific",
    items: [
      { name: "Pipette Tips (10μL)", quantity: 5, price: 45.99 },
      { name: "Centrifuge Tubes", quantity: 2, price: 67.00 },
    ],
    totalAmount: 244.95,
    status: "delivered",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-18",
    requestedBy: "Dr. Sarah Chen",
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    supplier: "Sigma-Aldrich",
    items: [
      { name: "Sodium Chloride (NaCl)", quantity: 10, price: 29.99 },
    ],
    totalAmount: 299.90,
    status: "shipped",
    orderDate: "2024-01-20",
    deliveryDate: "2024-01-25",
    requestedBy: "Dr. John Doe",
  },
  {
    id: 3,
    orderNumber: "ORD-2024-003",
    supplier: "VWR",
    items: [
      { name: "Microscope Slides", quantity: 20, price: 12.50 },
      { name: "Cover Slips", quantity: 10, price: 8.75 },
    ],
    totalAmount: 337.50,
    status: "pending",
    orderDate: "2024-01-22",
    deliveryDate: "2024-01-30",
    requestedBy: "Lab Tech Mike",
  },
];

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <Package className="h-4 w-4 text-green-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <ShoppingCart className="h-4 w-4 text-yellow-600" />;
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSupplier = filterSupplier === "all" || order.supplier === filterSupplier;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Portal</h1>
                <p className="text-gray-600 mt-1">Manage laboratory supply orders</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Package className="h-4 w-4" />
                  Catalog
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-xl font-bold">{orders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-50 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-xl font-bold">{pendingOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivered</p>
                      <p className="text-xl font-bold">{deliveredOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  <SelectItem value="Fisher Scientific">Fisher Scientific</SelectItem>
                  <SelectItem value="Sigma-Aldrich">Sigma-Aldrich</SelectItem>
                  <SelectItem value="VWR">VWR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-white p-2 rounded-lg border">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Supplier</p>
                              <p className="font-medium">{order.supplier}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Order Date</p>
                              <p className="font-medium">{order.orderDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Delivery Date</p>
                              <p className="font-medium">{order.deliveryDate}</p>
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Items ({order.items.length})</p>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                  {item.name} - Qty: {item.quantity} - ${item.price.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Requested by: {order.requestedBy}</span>
                            <span className="font-medium text-green-600">
                              Total: ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Track Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orders;
