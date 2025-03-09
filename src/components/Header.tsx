
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  DollarSign, 
  BarChart4, 
  Target
} from 'lucide-react';

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { path: '/budget', name: 'Budget', icon: <DollarSign className="h-4 w-4" /> },
    { path: '/expenses', name: 'Expenses', icon: <BarChart4 className="h-4 w-4" /> },
    { path: '/goals', name: 'Goals', icon: <Target className="h-4 w-4" /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-1">
              <div className="h-6 w-6 rounded-full bg-primary/80 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">E</span>
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tighter animate-fade-up">Econova</h1>
          </Link>

          {user && (
            <nav className="ml-6 hidden md:flex">
              <ul className="flex gap-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                        isActive(item.path) 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-primary/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-alert" onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {user && (
        <div className="border-t border-white/5 md:hidden">
          <div className="container">
            <nav className="overflow-x-auto">
              <ul className="flex gap-1 py-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                        isActive(item.path) 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-primary/5'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
