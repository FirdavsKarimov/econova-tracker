
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from '@/context/FinanceContext';
import { categories } from '@/data/mockData';
import { toast } from "@/components/ui/use-toast";

interface ExpenseFormData {
  amount: number;
  category: string;
  description: string;
}

const ExpenseForm = () => {
  const [open, setOpen] = useState(false);
  const { addExpense } = useFinance();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>();

  const onSubmit = (data: ExpenseFormData) => {
    addExpense({
      ...data,
      amount: parseFloat(data.amount.toString()),
      date: new Date().toISOString(),
    });
    
    toast({
      title: "Expense Added",
      description: `${data.amount} UZS for ${data.category} has been added`,
    });
    
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-hover animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="text-center">Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UZS)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="25000"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be positive' }
              })}
              className={errors.amount ? 'border-alert' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-alert">{errors.amount.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              defaultValue=""
              onValueChange={(value) => {
                register('category', { value }).onChange({ target: { value } });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-alert">{errors.category.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              {...register('description', { required: 'Description is required' })}
              className={errors.description ? 'border-alert' : ''}
            />
            {errors.description && (
              <p className="text-sm text-alert">{errors.description.message}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm;
