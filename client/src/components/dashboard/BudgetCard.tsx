import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchWithAuth, createWithAuth, invalidateQueries } from '@/lib/api';
import { BudgetItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BUDGET_CATEGORIES } from '@/types';
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

const budgetItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  item: z.string().min(1, 'Item name is required'),
  estimatedCost: z.coerce.number().positive('Cost must be positive'),
  actualCost: z.coerce.number().positive('Cost must be positive').optional(),
  paid: z.boolean().default(false),
  notes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetItemSchema>;

const BudgetCard: React.FC = () => {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [totalBudget, setTotalBudget] = useState(1500000); // ₹15,00,000
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [spentAmount, setSpentAmount] = useState(0);
  const [budgetPercentage, setBudgetPercentage] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  
  // Fetch budget items
  const { data: budgetItems = [], isLoading } = useQuery({
    queryKey: ['/api/budget'],
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
      invalidateQueries('/api/budget');
      toast({ 
        title: "Budget Item Added", 
        description: "Your budget item has been added successfully." 
      });
      form.reset();
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add budget item.", 
        variant: "destructive" 
      });
    }
  });
  
  // Calculate totals
  useEffect(() => {
    if (budgetItems.length > 0) {
      const totals: Record<string, number> = {};
      let total = 0;
      
      budgetItems.forEach((item: BudgetItem) => {
        const cost = item.actualCost || item.estimatedCost;
        total += cost;
        
        if (totals[item.category]) {
          totals[item.category] += cost;
        } else {
          totals[item.category] = cost;
        }
      });
      
      setCategoryTotals(totals);
      setSpentAmount(total);
      setBudgetPercentage(Math.round((total / totalBudget) * 100));
    }
  }, [budgetItems, totalBudget]);
  
  // Handle form submission
  const onSubmit = (data: BudgetFormValues) => {
    createBudgetItemMutation.mutate(data);
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
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="bg-[#800000] h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${budgetPercentage}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          ></motion.div>
        </div>
        
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
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              className="mt-4 w-full border border-[#800000] text-[#800000] py-2 rounded-md text-sm hover:bg-[#800000] hover:text-white transition-all duration-300"
              variant="outline"
            >
              Add Budget Item
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Budget Item</DialogTitle>
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
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="maroon-gradient">
                    Add Item
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default BudgetCard;
