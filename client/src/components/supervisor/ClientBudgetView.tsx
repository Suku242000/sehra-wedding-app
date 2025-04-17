import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, DollarSign, Calendar, Plus, Minus, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

// Props for the component
interface ClientBudgetViewProps {
  clientId: number;
  clientName?: string;
}

export default function ClientBudgetView({ clientId, clientName }: ClientBudgetViewProps) {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Fetch client budget items
  const { data: budgetItems = [], isLoading, error } = useQuery<BudgetItem[]>({
    queryKey: ['/api/supervisor/client-budget', clientId],
    queryFn: () => fetchWithAuth(`/api/supervisor/client-budget/${clientId}`),
    enabled: !!clientId,
  });

  // Fetch client information
  const { data: clientInfo } = useQuery<User>({
    queryKey: ['/api/supervisor/client-info', clientId],
    queryFn: () => fetchWithAuth(`/api/supervisor/client-info/${clientId}`),
    enabled: !!clientId,
  });

  // Calculate summary data
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalPaid: 0, 
    totalAdvance: 0,
    serviceCharge: 0,
    pendingPayments: 0,
    riskItems: [] as BudgetItem[],
  });

  useEffect(() => {
    if (budgetItems && budgetItems.length > 0) {
      let totalSpent = 0;
      let totalPaid = 0;
      let totalAdvance = 0;
      let serviceCharge = 0;
      const riskItems: BudgetItem[] = [];

      budgetItems.forEach(item => {
        const cost = item.actualCost || item.estimatedCost;
        totalSpent += cost;

        if (item.paid) {
          totalPaid += cost;
        }

        if (item.advanceAmount) {
          totalAdvance += item.advanceAmount;
        }

        if (item.serviceChargeAmount) {
          serviceCharge += item.serviceChargeAmount;
        }

        // Identify risk items (high value, not paid)
        if (cost > 50000 && item.paymentStatus === 'not_paid') {
          riskItems.push(item);
        }
      });

      // Estimate the total budget based on spent plus 20%
      const estimatedTotalBudget = totalSpent * 1.2;
      setTotalBudget(estimatedTotalBudget);

      setSummary({
        totalSpent,
        totalPaid,
        totalAdvance,
        serviceCharge,
        pendingPayments: totalSpent - totalPaid,
        riskItems
      });
    }
  }, [budgetItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'fully_paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'advance_paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partially_paid': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'fully_paid': return 'Fully Paid';
      case 'advance_paid': return 'Advance Paid';
      case 'partially_paid': return 'Partially Paid';
      default: return 'Not Paid';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load client budget information.</AlertDescription>
      </Alert>
    );
  }

  const clientPackage = clientInfo?.package?.toUpperCase() || 'SILVER';
  
  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#800000] to-[#5c0000] text-white">
        <CardTitle className="flex items-center justify-between">
          <span>Budget Overview - {clientName || `Client #${clientId}`}</span>
          <Badge className="bg-white text-[#800000]">
            {clientPackage} Package
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="advance">Advance Payments</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Budget (Est.)</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                  <div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Paid</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Pending Amount</div>
                  <div className="text-2xl font-bold text-amber-600">{formatCurrency(summary.pendingPayments)}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Budget Utilization</h3>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    summary.totalSpent / totalBudget > 0.9 ? 'bg-red-500' : 
                    summary.totalSpent / totalBudget > 0.7 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((summary.totalSpent / totalBudget) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{formatCurrency(summary.totalSpent)} spent of {formatCurrency(totalBudget)}</span>
                <span>{Math.round((summary.totalSpent / totalBudget) * 100)}% utilized</span>
              </div>
            </div>
            
            {summary.riskItems.length > 0 && (
              <Alert className="mt-6 border-amber-300 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Attention Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  There are {summary.riskItems.length} high-value unpaid items that need attention.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-right">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budgetItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No budget items found for this client.
                      </td>
                    </tr>
                  ) : (
                    budgetItems.map((item) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.item}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.actualCost || item.estimatedCost)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={cn("text-xs", getPaymentStatusColor(item.paymentStatus))}>
                            {getPaymentStatusText(item.paymentStatus)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.vendorName || 'Not specified'}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="advance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Advance Payments</div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalAdvance)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Advance Payment Ratio</div>
                  <div className="text-2xl font-bold">
                    {summary.totalSpent > 0 ? Math.round((summary.totalAdvance / summary.totalSpent) * 100) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-right">Advance Amount</th>
                    <th className="px-4 py-2 text-center">Date</th>
                    <th className="px-4 py-2 text-right">Total Cost</th>
                    <th className="px-4 py-2 text-right">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budgetItems.filter(item => item.advanceAmount && item.advanceAmount > 0).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No advance payments recorded for this client.
                      </td>
                    </tr>
                  ) : (
                    budgetItems
                      .filter(item => item.advanceAmount && item.advanceAmount > 0)
                      .map((item) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.item}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-blue-600">
                            {formatCurrency(item.advanceAmount || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {formatDate(item.advanceDate)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(item.actualCost || item.estimatedCost)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.vendorName || 'Not specified'}
                          </td>
                        </motion.tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payment Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Payment Completion Rate</span>
                      <span className="font-medium">
                        {summary.totalSpent > 0 ? Math.round((summary.totalPaid / summary.totalSpent) * 100) : 0}%
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${
                          summary.totalPaid / summary.totalSpent > 0.8 ? 'bg-green-500' : 
                          summary.totalPaid / summary.totalSpent > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((summary.totalPaid / summary.totalSpent) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span>Advance Payment Ratio</span>
                      <span className="font-medium">
                        {summary.totalSpent > 0 ? Math.round((summary.totalAdvance / summary.totalSpent) * 100) : 0}%
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min((summary.totalAdvance / summary.totalSpent) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Service Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Client Package</span>
                      <Badge>{clientPackage}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Service Charge</span>
                      <span className="font-medium">{formatCurrency(summary.serviceCharge)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Service Charge Rate</span>
                      <span className="font-medium">
                        {clientPackage === 'PLATINUM' ? '8%' : clientPackage === 'GOLD' ? '5%' : '2%'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Grand Total (with Service Charge)</span>
                      <span className="font-medium text-[#800000]">
                        {formatCurrency(summary.totalSpent + summary.serviceCharge)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {summary.riskItems.length > 0 && (
              <Card className="mt-4 border-amber-200">
                <CardHeader className="pb-2 bg-amber-50">
                  <CardTitle className="text-base text-amber-800 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700 mb-4">
                    The following high-value items are still unpaid and may require follow-up:
                  </p>
                  <div className="space-y-2">
                    {summary.riskItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
                        <div>
                          <div className="font-medium">{item.item}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.actualCost || item.estimatedCost)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 border-t px-6 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <InfoIcon className="h-4 w-4 mr-2" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
}