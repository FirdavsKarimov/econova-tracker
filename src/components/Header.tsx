
import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="w-full sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and app name */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">E</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Econova</h1>
        </div>

        {/* Navigation - desktop */}
        {!isMobile && (
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-foreground/90 hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="text-foreground/90 hover:text-primary transition-colors">Transactions</a>
            <a href="#" className="text-foreground/90 hover:text-primary transition-colors">Budgets</a>
            <a href="#" className="text-foreground/90 hover:text-primary transition-colors">Goals</a>
            <a href="#" className="text-foreground/90 hover:text-primary transition-colors">Reports</a>
          </nav>
        )}

        {/* Actions - notifications and menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-alert"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] p-4">
              <h3 className="font-semibold mb-2">Notifications</h3>
              <div className="space-y-2">
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">Budget Alert</span>
                    <span className="text-sm text-muted-foreground">You've exceeded your Food budget</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">Goal Progress</span>
                    <span className="text-sm text-muted-foreground">You're 50% toward your Emergency Fund goal</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-4">
                    <a 
                      href="#" 
                      className="px-2 py-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                    <a 
                      href="#" 
                      className="px-2 py-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Transactions
                    </a>
                    <a 
                      href="#" 
                      className="px-2 py-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Budgets
                    </a>
                    <a 
                      href="#" 
                      className="px-2 py-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Goals
                    </a>
                    <a 
                      href="#" 
                      className="px-2 py-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Reports
                    </a>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
