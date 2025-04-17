import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';
import PaymentSummary from './PaymentSummary';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign, 
  CalendarDays,
  FileText,
  BarChart3
} from 'lucide-react';

interface BudgetItem {
  id: number;
  userId: number;
  category: string;
  item: string;
  estimatedCost: number;
  actualCost: number | null;
  paid: boolean | null;
  paymentStatus: 'not_paid' | 'advance_paid' | 'partially_paid' | 'fully_paid';
  advanceAmount: number | null;
  advanceDate: Date | null;
  vendorId: number | null;
  vendorName: string | null;
  billingInfo: {
    userBillId: string | null;
    vendorBillId: string | null;
    billDate: Date | null;
  } | null;
  serviceChargePercentage: number | null;
  serviceChargeAmount: number | null;
  serviceChargeEdited: boolean | null;
  notes: string | null;
  createdAt: Date | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  package?: string;
}

interface ClientBudgetViewProps {
  clientId: number;
  clientName?: string;
}

export default function ClientBudgetView({ clientId, clientName }: ClientBudgetViewProps) {
  const { toast } = useToast();
  const [clientPackage, setClientPackage] = useState<string>('silver');
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalAdvancePaid, setTotalAdvancePaid] = useState<number>(0);
  const [percentageSpent, setPercentageSpent] = useState<number>(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(2); // Default 2% for Silver
  const [totalServiceCharge, setTotalServiceCharge] = useState<number>(0);
  
  // Fetch client budget items
  const { data: budgetItems = [], isLoading: isBudgetLoading } = useQuery<BudgetItem[]>({
    queryKey: ['/api/supervisor/client-budget', clientId],
    queryFn: () => fetchWithAuth(`/api/supervisor/client-budget/${clientId}`),
    enabled: !!clientId,
  });
  
  // Fetch client information
  const { data: clientInfo, isLoading: isClientLoading } = useQuery<User>({
    queryKey: ['/api/supervisor/client-info', clientId],
    queryFn: () => fetchWithAuth(`/api/supervisor/client-info/${clientId}`),
    enabled: !!clientId,
  });
  
  // Calculate totals and summaries
  useEffect(() => {
    if (budgetItems.length > 0) {
      const totals: Record<string, number> = {};
      let estimatedTotal = 0;
      let actualTotal = 0;
      let advanceTotal = 0;
      
      budgetItems.forEach((item) => {
        const estimatedCost = item.estimatedCost || 0;
        const actualCost = item.actualCost || estimatedCost;
        const advanceAmount = item.advanceAmount || 0;
        
        estimatedTotal += estimatedCost;
        
        // Only count actual costs in the total if the item has an actual cost or is marked as paid
        if (item.actualCost || item.paid) {
          actualTotal += actualCost;
        }
        
        // Add to advance payment total
        advanceTotal += advanceAmount;
        
        // Track by category
        if (totals[item.category]) {
          totals[item.category] += actualCost;
        } else {
          totals[item.category] = actualCost;
        }
      });
      
      // Update state with calculations
      setCategoryTotals(totals);
      setTotalBudget(estimatedTotal);
      setTotalSpent(actualTotal);
      setTotalAdvancePaid(advanceTotal);
      
      // Calculate percentage spent of total estimated
      if (estimatedTotal > 0) {
        setPercentageSpent(Math.round((actualTotal / estimatedTotal) * 100));
      }
    } else {
      // Reset values if no budget items
      setCategoryTotals({});
      setTotalBudget(0);
      setTotalSpent(0);
      setTotalAdvancePaid(0);
      setPercentageSpent(0);
    }
  }, [budgetItems]);
  
  // Set service charge rate based on client package
  useEffect(() => {
    if (clientInfo?.package) {
      switch (clientInfo.package.toUpperCase()) {
        case 'GOLD':
          setServiceChargeRate(5);
          setClientPackage('gold');
          break;
        case 'PLATINUM':
          setServiceChargeRate(8);
          setClientPackage('platinum');
          break;
        default:
          setServiceChargeRate(2);
          setClientPackage('silver');
      }
      
      // Calculate total service charge
      setTotalServiceCharge(Math.round(totalSpent * (serviceChargeRate / 100)));
    }
  }, [clientInfo, totalSpent, serviceChargeRate]);
  
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
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
  
  // Handle if loading
  if (isBudgetLoading || isClientLoading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <motion.div
      variants={fadeIn('up', 'tween')}
      initial="hidden"
      animate="show"
      className="w-full space-y-6"
    >
      <Card className={`border-l-4 border-l-${clientPackage === 'platinum' ? 'purple-600' : clientPackage === 'gold' ? 'amber-500' : 'gray-500'}`}>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>{clientName || clientInfo?.name || 'Client'}'s Budget</span>
            <Badge variant="secondary" className={`${clientPackage === 'platinum' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : clientPackage === 'gold' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}`}>
              {clientPackage.charAt(0).toUpperCase() + clientPackage.slice(1)} Package
            </Badge>
          </CardTitle>
          <CardDescription>
            Service Charge: {serviceChargeRate}% ({formatCurrency(totalServiceCharge)})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Payment Tracking</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Total Budget Card */}
                <Card className="bg-secondary/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium mb-1">Total Budget</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                      </div>
                      <div className="bg-primary/20 p-2 rounded-full">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Spent Amount Card */}
                <Card className="bg-secondary/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium mb-1">Total Spent</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                      </div>
                      <div className="bg-primary/20 p-2 rounded-full">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={percentageSpent} className="h-2" />
                      <p className="text-xs text-right mt-1">{percentageSpent}% of budget</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Advance Payments Card */}
                <Card className="bg-secondary/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium mb-1">Total Advances</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalAdvancePaid)}</p>
                      </div>
                      <div className="bg-primary/20 p-2 rounded-full">
                        <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={(totalAdvancePaid / totalSpent) * 100} className="h-2" />
                      <p className="text-xs text-right mt-1">
                        {totalSpent > 0 ? Math.round((totalAdvancePaid / totalSpent) * 100) : 0}% of spent amount
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Category-wise Summary */}
              {Object.keys(categoryTotals).length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(categoryTotals).map(([category, amount]) => (
                        <Card key={category} className="bg-secondary/5">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">{category}</p>
                              <p className="font-bold">{formatCurrency(amount)}</p>
                            </div>
                            <Progress 
                              value={(amount / totalSpent) * 100} 
                              className="h-1 mt-2" 
                            />
                            <p className="text-xs text-right mt-1">
                              {Math.round((amount / totalSpent) * 100)}% of total
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              {/* Budget Items Table */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Budget Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Estimated</TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="text-right">Advance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Vendor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budgetItems.length > 0 ? (
                          budgetItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.category}</TableCell>
                              <TableCell>{item.item}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.estimatedCost)}</TableCell>
                              <TableCell className="text-right">{item.actualCost ? formatCurrency(item.actualCost) : '-'}</TableCell>
                              <TableCell className="text-right">
                                {item.advanceAmount ? (
                                  <div>
                                    {formatCurrency(item.advanceAmount)}
                                    <div className="text-xs text-muted-foreground">
                                      {item.advanceDate && format(new Date(item.advanceDate), 'dd MMM yyyy')}
                                    </div>
                                  </div>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{getPaymentStatusBadge(item.paymentStatus)}</TableCell>
                              <TableCell>{item.vendorName || '-'}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                              No budget items found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <PaymentSummary clientId={clientId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}