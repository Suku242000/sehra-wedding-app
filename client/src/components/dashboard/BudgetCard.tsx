import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, updateWithAuth, deleteWithAuth } from '@/lib/api';
import { BudgetItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BUDGET_CATEGORIES } from '@/types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Frown, 
  Smile, 
  Meh, 
  TrendingUp, 
  TrendingDown,
  Pencil,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';

const budgetItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  item: z.string().min(1, 'Item name is required'),
  estimatedCost: z.coerce.number().positive('Cost must be positive'),
  actualCost: z.coerce.number().positive('Cost must be positive').optional(),
  paid: z.boolean().default(false),
  notes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetItemSchema>;

// Mood types
type BudgetMoodType = 'excellent' | 'good' | 'fair' | 'warning' | 'critical';

// Mood mapping for colors and icons
const budgetMoodConfig: Record<BudgetMoodType, { color: string; icon: React.ReactNode; description: string }> = {
  excellent: { 
    color: 'bg-green-500', 
    icon: <Smile className="h-5 w-5 text-green-500" />,
    description: 'Well under budget'
  },
  good: { 
    color: 'bg-green-400', 
    icon: <Smile className="h-5 w-5 text-green-400" />,
    description: 'Under budget'
  },
  fair: { 
    color: 'bg-yellow-400', 
    icon: <Meh className="h-5 w-5 text-yellow-500" />,
    description: 'On budget'
  },
  warning: { 
    color: 'bg-orange-500', 
    icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    description: 'Approaching limit'
  },
  critical: { 
    color: 'bg-red-500', 
    icon: <Frown className="h-5 w-5 text-red-500" />,
    description: 'Over budget'
  }
};

const BudgetCard: React.FC = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [totalBudget, setTotalBudget] = useState(1500000); // ₹15,00,000
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [spentAmount, setSpentAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [budgetPercentage, setBudgetPercentage] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [budgetMood, setBudgetMood] = useState<BudgetMoodType>('fair');
  const [spendingTrend, setSpendingTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable');
  const [previousSpentAmount, setPreviousSpentAmount] = useState(0);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [showItemsList, setShowItemsList] = useState(false);
  
  // Fetch budget items with auth
  const { data: budgetItems = [], isLoading, refetch } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget'],
    queryFn: () => fetchWithAuth('/api/budget'),
    enabled: true, // Always enabled
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });
  
  // Form
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      category: '',
      item: '',
      estimatedCost: 0,
      actualCost: undefined,
      paid: false,
      notes: '',
    },
  });
  
  // Create budget item mutation
  const createBudgetItemMutation = useMutation({
    mutationFn: (newItem: BudgetFormValues) => createWithAuth('/api/budget', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      refetch(); // Immediate refetch to update UI
      toast({ 
        title: "Budget Item Added", 
        description: "Your budget item has been added successfully." 
      });
      form.reset();
      setOpenDialog(false);
      setShowItemsList(true); // Show all items after adding new one
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add budget item.", 
        variant: "destructive" 
      });
    }
  });
  
  // Update budget item mutation
  const updateBudgetItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: BudgetFormValues }) => 
      updateWithAuth(`/api/budget/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      refetch(); // Immediate refetch to update UI
      toast({ 
        title: "Budget Item Updated", 
        description: "Your budget item has been updated successfully." 
      });
      form.reset();
      setEditingBudgetItem(null);
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update budget item.", 
        variant: "destructive" 
      });
    }
  });
  
  // Delete budget item mutation
  const deleteBudgetItemMutation = useMutation({
    mutationFn: (id: number) => deleteWithAuth(`/api/budget/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      refetch(); // Immediate refetch to update UI
      toast({ 
        title: "Budget Item Deleted", 
        description: "Your budget item has been deleted successfully." 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete budget item.", 
        variant: "destructive" 
      });
    }
  });
  
  // Calculate totals and budget mood
  useEffect(() => {
    if (budgetItems && budgetItems.length > 0) {
      const totals: Record<string, number> = {};
      let estimatedTotal = 0;
      let actualTotal = 0;
      let paidTotal = 0;
      
      budgetItems.forEach((item) => {
        const estimatedCost = item.estimatedCost || 0;
        const actualCost = item.actualCost || estimatedCost;
        
        estimatedTotal += estimatedCost;
        
        // Only count actual costs in the total if the item has an actual cost or is marked as paid
        if (item.actualCost || item.paid) {
          actualTotal += actualCost;
        }
        
        // For paid items, add to paid total
        if (item.paid) {
          paidTotal += actualCost;
        }
        
        // Track by category
        if (totals[item.category]) {
          totals[item.category] += actualCost;
        } else {
          totals[item.category] = actualCost;
        }
      });
      
      setCategoryTotals(totals);
      
      // Set spending trend based on actual expenses
      if (actualTotal > previousSpentAmount) {
        setSpendingTrend('increasing');
      } else if (actualTotal < previousSpentAmount) {
        setSpendingTrend('decreasing');
      } else {
        setSpendingTrend('stable');
      }
      
      setPreviousSpentAmount(spentAmount);
      setSpentAmount(actualTotal);
      setPaidAmount(paidTotal);
      
      const percentage = Math.round((actualTotal / totalBudget) * 100);
      setBudgetPercentage(percentage);
      
      // Calculate budget mood based on percentage of budget used
      if (percentage <= 30) {
        setBudgetMood('excellent');
      } else if (percentage <= 60) {
        setBudgetMood('good');
      } else if (percentage <= 80) {
        setBudgetMood('fair');
      } else if (percentage <= 100) {
        setBudgetMood('warning');
      } else {
        setBudgetMood('critical');
      }
    }
  }, [budgetItems, totalBudget, previousSpentAmount, spentAmount]);
  
  // Handle edit budget item
  const handleEdit = (item: BudgetItem) => {
    setEditingBudgetItem(item);
    form.reset({
      category: item.category,
      item: item.item,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost || undefined,
      paid: item.paid || false,
      notes: item.notes || '',
    });
    setOpenDialog(true);
  };

  // Handle delete budget item
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget item?')) {
      deleteBudgetItemMutation.mutate(id);
    }
  };

  // Handle form submission
  const onSubmit = (data: BudgetFormValues) => {
    if (editingBudgetItem) {
      updateBudgetItemMutation.mutate({
        id: editingBudgetItem.id,
        data
      });
    } else {
      createBudgetItemMutation.mutate(data);
    }
  };
  
  // Format as rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      variants={fadeIn('up', 'tween', 0.4, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="bg-[#800000] py-3 px-4 border-b border-[#5c0000]">
        <h2 className="text-white font-medium">Budget Tracker</h2>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-500">Total Budget</div>
            {isEditingBudget ? (
              <div className="flex items-center">
                <Input
                  type="number"
                  className="w-40 mr-2"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  min="0"
                  step="10000"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditingBudget(false)}
                  className="h-8"
                >
                  Save
                </Button>
              </div>
            ) : (
              <div 
                className="text-2xl font-medium flex items-center cursor-pointer" 
                onClick={() => setIsEditingBudget(true)}
              >
                {formatCurrency(totalBudget)}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </Button>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Spent So Far</div>
            <div className="text-xl font-medium text-[#800000]">{formatCurrency(spentAmount)}</div>
          </div>
        </div>
        
        {/* Budget Mood Indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {budgetMoodConfig[budgetMood].icon}
            <span className="ml-2 text-sm font-medium">Budget Mood: {budgetMood.charAt(0).toUpperCase() + budgetMood.slice(1)}</span>
          </div>
          <Badge 
            className={`flex items-center ${
              spendingTrend === 'increasing' 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : spendingTrend === 'decreasing' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}
          >
            {spendingTrend === 'increasing' ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : spendingTrend === 'decreasing' ? (
              <TrendingDown className="w-3 h-3 mr-1" />
            ) : null}
            {spendingTrend.charAt(0).toUpperCase() + spendingTrend.slice(1)}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <motion.div 
            className={`h-full rounded-full ${budgetMoodConfig[budgetMood].color}`}
            initial={{ width: '0%' }}
            animate={{ width: `${budgetPercentage}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          ></motion.div>
        </div>
        
        {/* Budget Status */}
        <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
          <span>{formatCurrency(spentAmount)} spent of {formatCurrency(totalBudget)}</span>
          <span>{budgetMoodConfig[budgetMood].description}</span>
        </div>
        
        {/* Paid vs Remaining - Only show when there are budget items */}
        {budgetItems.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Payment Status</h4>
              <Badge variant="outline" className="text-xs">
                {Math.round((paidAmount / spentAmount) * 100) || 0}% Paid
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-green-100">
                <div className="text-xs text-gray-500">Paid</div>
                <div className="font-medium text-green-600">{formatCurrency(paidAmount)}</div>
              </div>
              <div className="bg-white p-2 rounded border border-amber-100">
                <div className="text-xs text-gray-500">Remaining</div>
                <div className="font-medium text-amber-600">{formatCurrency(spentAmount - paidAmount)}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Categories */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div className="bg-gray-200 h-4 w-32 rounded"></div>
                  <div className="bg-gray-200 h-4 w-20 rounded"></div>
                </div>
              ))}
            </div>
          ) : Object.keys(categoryTotals).length === 0 ? (
            <div className="text-center py-3 text-gray-500">
              <p>No budget items added yet.</p>
            </div>
          ) : (
            Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span>{category}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))
          )}
        </div>
        
        {/* Show Budget Items List */}
        {showItemsList && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <div className="bg-gray-50 py-2 px-3 border-b">
              <h3 className="text-sm font-medium">All Budget Items</h3>
            </div>
            <div className="divide-y max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading budget items...
                </div>
              ) : budgetItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No budget items yet.
                </div>
              ) : (
                budgetItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{item.item}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">
                          {formatCurrency(item.actualCost || item.estimatedCost)}
                        </span>
                        {item.paid && (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            Paid
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0 text-[#800000]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Manage Budget Items Button and Dialog */}
        <div className="flex items-center justify-between mt-4">
          <Button 
            onClick={() => setShowItemsList(!showItemsList)}
            variant="outline" 
            className="flex-1 mr-2 text-[#800000] border-[#800000] hover:bg-[#800000] hover:text-white"
          >
            {showItemsList ? 'Hide All Items' : 'View All Items'}
          </Button>
          
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) {
              setEditingBudgetItem(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                className="flex-1 ml-2 border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-all duration-300"
                variant="outline"
              >
                Add Budget Item
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingBudgetItem ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUDGET_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estimatedCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="actualCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actual Cost (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              min="0"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : Number(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="paid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Paid</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Add notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setOpenDialog(false);
                      setEditingBudgetItem(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="maroon-gradient">
                      {editingBudgetItem ? 'Update Item' : 'Add Item'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetCard;