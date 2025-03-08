
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  formatCurrency, 
  calculateGoalProgress, 
  calculateDaysRemaining 
} from '@/utils/financeUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Target, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Calendar, 
  Coins
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface FinancialGoalsProps {
  compact?: boolean;
}

const FinancialGoals = ({ compact = false }: FinancialGoalsProps) => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  
  // Sort goals by progress percentage (ascending)
  const sortedGoals = [...goals].sort((a, b) => {
    const aProgress = calculateGoalProgress(a.currentAmount, a.targetAmount);
    const bProgress = calculateGoalProgress(b.currentAmount, b.targetAmount);
    return aProgress - bProgress;
  });
  
  // Limit display if compact mode
  const displayGoals = compact ? sortedGoals.slice(0, 3) : sortedGoals;
  
  const handleContribute = () => {
    if (selectedGoal && contributionAmount > 0) {
      updateGoal(selectedGoal, contributionAmount);
      setContributionAmount(0);
      setSelectedGoal(null);
      
      toast({
        title: "Contribution Added",
        description: `Added ${formatCurrency(contributionAmount)} to your goal`,
      });
    }
  };
  
  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
  };
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Financial Goals</CardTitle>
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          {compact 
            ? "Track progress on your top savings goals" 
            : "Track and manage all your savings goals"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayGoals.length > 0 ? (
            displayGoals.map((goal) => {
              const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
              const daysRemaining = calculateDaysRemaining(goal.deadline);
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{goal.name}</h4>
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : "Deadline passed"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedGoal(goal.id)}>
                            <Coins className="h-4 w-4 mr-2" />
                            Add Contribution
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-alert" 
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Goal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{progress}%</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No financial goals set yet
            </p>
          )}
          
          {compact && goals.length > 3 && (
            <Button variant="outline" className="w-full">
              View All Goals
            </Button>
          )}
          
          {!compact && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                  <DialogTitle>Create New Financial Goal</DialogTitle>
                  <DialogDescription>
                    Set up a new savings target to work towards
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Goal Name</Label>
                    <Input id="name" placeholder="e.g., Emergency Fund, New Car" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Amount (UZS)</Label>
                    <Input id="target" type="number" placeholder="5000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Savings (UZS)</Label>
                    <Input id="current" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Target Date</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Create Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Contribution dialog */}
          {selectedGoal && (
            <Dialog 
              open={Boolean(selectedGoal)} 
              onOpenChange={(open) => !open && setSelectedGoal(null)}
            >
              <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                  <DialogTitle>Add Contribution</DialogTitle>
                  <DialogDescription>
                    Add money to your savings goal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="contribution">Contribution Amount (UZS)</Label>
                    <Input 
                      id="contribution" 
                      type="number" 
                      placeholder="50000" 
                      value={contributionAmount || ''} 
                      onChange={(e) => setContributionAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button onClick={handleContribute}>Add Contribution</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialGoals;
