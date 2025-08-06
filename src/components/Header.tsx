import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Github, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  repositoryUrl?: string;
}

export default function Header({ repositoryUrl = "https://github.com/your-repo" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Use cases", href: "#use-cases", active: true },
    { label: "Favourites", href: "#favourites" },
  ];

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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(repositoryUrl, '_blank')}
              className="group"
            >
              <Github className="w-4 h-4 mr-2" />
              Repository
              <ExternalLink className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm" className="group">
              Book a demo
              <ExternalLink className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button size="sm" variant="secondary">
              Start for free
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start group"
                  onClick={() => {
                    window.open(repositoryUrl, '_blank');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Repository
                  <ExternalLink className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Sign in
                </Button>
                <Button size="sm" className="w-full group">
                  Book a demo
                  <ExternalLink className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button size="sm" variant="secondary" className="w-full">
                  Start for free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}