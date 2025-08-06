import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, ExternalLink, User, LogOut, Settings, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  repositoryUrl?: string;
  showAdminView?: boolean;
  onToggleAdminView?: () => void;
}

export default function Header({ 
  repositoryUrl = "https://github.com/your-repo",
  showAdminView = false,
  onToggleAdminView
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { label: "Use cases", href: "#use-cases", active: true },
    { label: "Favourites", href: "#favourites" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl">SaasTool</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  item.active 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {onToggleAdminView && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onToggleAdminView}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showAdminView ? 'User View' : 'Admin View'}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign in
              </Button>
            )}
            <Button size="sm" className="group">
              Book a demo
              <ExternalLink className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 py-4 space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    {onToggleAdminView && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => {
                          onToggleAdminView();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showAdminView ? 'User View' : 'Admin View'}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/admin');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign in
                  </Button>
                )}
                <Button size="sm" className="w-full group">
                  Book a demo
                  <ExternalLink className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}