import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PaymentSummaryProps {
  clientId: number;
}

interface PaymentItem {
  id: number;
  category: string;
  item: string;
  estimatedCost: number;
  actualCost: number | null;
  paymentStatus: 'not_paid' | 'advance_paid' | 'partially_paid' | 'fully_paid';
  advanceAmount: number | null;
  advanceDate: string | null;
  dueDate?: string | null;
  vendorName: string | null;
}

export default function PaymentSummary({ clientId }: PaymentSummaryProps) {
  // Fetch payment data for the client
  const { data: paymentItems = [], isLoading } = useQuery<PaymentItem[]>({
    queryKey: ['/api/supervisor/client-payments', clientId],
    queryFn: () => fetchWithAuth(`/api/supervisor/client-budget/${clientId}`),
    enabled: !!clientId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate payment metrics
  const pendingPayments = paymentItems.filter(item => item.paymentStatus === 'not_paid');
  const advancePayments = paymentItems.filter(item => item.paymentStatus === 'advance_paid');
  const fullyPaidItems = paymentItems.filter(item => item.paymentStatus === 'fully_paid');
  
  const totalBudget = paymentItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalAdvancePaid = paymentItems.reduce((sum, item) => sum + (item.advanceAmount || 0), 0);
  const totalPendingAmount = pendingPayments.reduce((sum, item) => sum + item.estimatedCost, 0);
  
  const advancePaymentPercentage = totalBudget > 0 
    ? Math.round((totalAdvancePaid / totalBudget) * 100) 
    : 0;
  
  const pendingPercentage = totalBudget > 0 
    ? Math.round((totalPendingAmount / totalBudget) * 100) 
    : 0;

  // Group items by category for the summary
  const categoryTotals: Record<string, {total: number, paid: number, pending: number}> = {};
  
  paymentItems.forEach(item => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = {
        total: 0,
        paid: 0,
        pending: 0
      };
    }
    
    categoryTotals[item.category].total += item.estimatedCost;
    
    if (item.paymentStatus === 'fully_paid') {
      categoryTotals[item.category].paid += item.estimatedCost;
    } else if (item.paymentStatus === 'advance_paid' && item.advanceAmount) {
      categoryTotals[item.category].paid += item.advanceAmount;
      categoryTotals[item.category].pending += (item.estimatedCost - item.advanceAmount);
    } else {
      categoryTotals[item.category].pending += item.estimatedCost;
    }
  });

  // Get appropriate payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_paid':
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="h-3 w-3" /> Fully Paid
        </Badge>;
      case 'advance_paid':
        return <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-300">
          <Clock className="h-3 w-3" /> Advance Paid
        </Badge>;
      case 'partially_paid':
        return <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-300">
          <AlertTriangle className="h-3 w-3" /> Partially Paid
        </Badge>;
      default:
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Not Paid
        </Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeIn('up', 'tween')}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Advance Paid */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Advance Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAdvancePaid)}</p>
                <p className="text-xs text-muted-foreground mt-1">{advancePaymentPercentage}% of total budget</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={advancePaymentPercentage} className="h-1 mt-4" />
          </CardContent>
        </Card>

        {/* Total Pending */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingPercentage}% of total budget</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <Progress value={pendingPercentage} className="h-1 mt-4" />
          </CardContent>
        </Card>

        {/* Payment Status Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-gray-100">
                    {pendingPayments.length} Pending
                  </Badge>
                  <Badge variant="outline" className="bg-amber-100">
                    {advancePayments.length} Advance Paid
                  </Badge>
                  <Badge variant="outline" className="bg-green-100">
                    {fullyPaidItems.length} Fully Paid
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden flex">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${pendingPayments.length / paymentItems.length * 100}%` }} 
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${advancePayments.length / paymentItems.length * 100}%` }} 
                />
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${fullyPaidItems.length / paymentItems.length * 100}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="advances">Advance Payments</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Items that require payment attention</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.vendorName || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.estimatedCost)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(item.paymentStatus)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <p>No pending payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advances">
          <Card>
            <CardHeader>
              <CardTitle>Advance Payments</CardTitle>
              <CardDescription>Payments made in advance</CardDescription>
            </CardHeader>
            <CardContent>
              {advancePayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Advance Paid</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advancePayments.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.vendorName || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.advanceAmount || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.estimatedCost - (item.advanceAmount || 0))}</TableCell>
                        <TableCell>
                          {item.advanceDate ? format(new Date(item.advanceDate), 'dd MMM yyyy') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <p>No advance payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Payments by Category</CardTitle>
              <CardDescription>Budget breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryTotals).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categoryTotals).map(([category, data]) => (
                    <Card key={category} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="font-medium">{formatCurrency(data.total)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Paid</span>
                            <span className="font-medium text-green-600">{formatCurrency(data.paid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <span className="font-medium text-red-600">{formatCurrency(data.pending)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pb-4 pt-0">
                        <Progress 
                          value={(data.paid / data.total) * 100}
                          className="h-2 w-full" 
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {Math.round((data.paid / data.total) * 100)}% paid
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}