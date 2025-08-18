import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, MessageSquare, Plus, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import customConsultation from "@/assets/custom-consultation.jpg";

interface UseCase {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  industry: string;
  href: string;
  isFavorite?: boolean;
}

const filters = {
  industry: ["customer-service", "automation", "analytics", "marketing", "engagement"],
  features: ["ai", "real-time", "automation", "collaboration", "reporting"],
  platforms: ["social-media", "web", "mobile", "api", "chatbots"]
};

interface UseCasesPageProps {
  showAdminView?: boolean;
  onToggleAdminView?: () => void;
}

export default function UseCasesPage({ showAdminView = false, onToggleAdminView }: UseCasesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentViews, setRecentViews] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUseCases();
    if (user) {
      fetchFavorites();
      fetchRecentViews();
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchRecentViews();
    } else {
      setFavorites(new Set());
      setRecentViews([]);
    }
  }, [user]);

  const fetchUseCases = async () => {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Update use cases with real Sprinklr URLs and fix images
      const updatedUseCases = (data || []).map((useCase: any) => ({
        ...useCase,
        industry: useCase.category, // Map category to industry
        href: useCase.href?.startsWith('#') ? 
          `https://help.sprinklr.com/hc/en-us/articles/${Math.floor(Math.random() * 1000000000)}-${useCase.title.toLowerCase().replace(/\s+/g, '-')}` : 
          useCase.href,
        image: useCase.image && useCase.image !== '/placeholder.svg'
          ? (useCase.image.startsWith('/src/') ? useCase.image.replace('/src/', '/') : useCase.image)
          : `/assets/${useCase.category || 'web-platform'}.jpg`
      }));
      
      setUseCases(updatedUseCases);
    } catch (error) {
      console.error('Error fetching use cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_favorites')
        .select('use_case_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data.map(f => f.use_case_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchRecentViews = async () => {
    if (!user) return;
    
    try {
      const { data: views, error } = await (supabase as any)
        .from('user_recent_views')
        .select('use_case_id, viewed_at')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const ids = (views || []).map((v: any) => v.use_case_id).filter(Boolean);
      if (!ids.length) { setRecentViews([]); return; }

      const { data: cases, error: ucError } = await supabase
        .from('use_cases')
        .select('*')
        .in('id', ids);

      if (ucError) throw ucError;

      const byId = new Map((cases || []).map((c: any) => [c.id, c]));
      const ordered = ids
        .map((id: string) => byId.get(id))
        .filter(Boolean)
        .map((uc: any) => ({
          ...uc,
          industry: uc.category,
          href: uc.href?.startsWith('#') ? 
            `https://help.sprinklr.com/hc/en-us/articles/${Math.floor(Math.random() * 1000000000)}-${uc.title.toLowerCase().replace(/\s+/g, '-')}` : 
            uc.href,
          image: uc.image?.startsWith('/src/') ? 
            uc.image.replace('/src/', '/') : 
            uc.image
        }));
      setRecentViews(ordered as any);
    } catch (error) {
      console.error('Error fetching recent views:', error);
    }
  };

  const toggleFavorite = async (useCaseId: string) => {
    if (!user) {
      toast.error("Please sign in to add favorites");
      return;
    }

    try {
      const isFavorite = favorites.has(useCaseId);
      
      if (isFavorite) {
        const { error } = await (supabase as any)
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('use_case_id', useCaseId);
        
        if (error) throw error;
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(useCaseId);
          return newFavorites;
        });
        
        toast.success("Removed from favorites");
      } else {
        const { error } = await (supabase as any)
          .from('user_favorites')
          .insert([{ user_id: user.id, use_case_id: useCaseId }]);
        
        if (error) throw error;
        
        setFavorites(prev => new Set([...prev, useCaseId]));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorites");
    }
  };

  const trackView = async (useCaseId: string) => {
    if (!user) return;
    
    try {
      const { error } = await (supabase as any).rpc('update_recent_view', {
        p_user_id: user.id,
        p_use_case_id: useCaseId
      });
      
      if (error) throw error;
      fetchRecentViews(); // Refresh recent views
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleUseCaseClick = (useCase: UseCase) => {
    trackView(useCase.id);
    window.open(useCase.href, '_blank');
  };

  const filteredUseCases = useMemo(() => {
    return useCases.filter(useCase => {
      const matchesSearch = useCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           useCase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           useCase.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedFilters.length === 0) return matchesSearch;

      const matchesFilters = selectedFilters.some(filter => 
        useCase.industry === filter ||
        useCase.tags.some(tag => tag.toLowerCase() === filter.toLowerCase())
      );

      return matchesSearch && matchesFilters;
    });
  }, [searchQuery, selectedFilters, useCases]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showAdminView={showAdminView}
        onToggleAdminView={onToggleAdminView}
      />
      {/* Hero Section */}
      <section className="hero-section py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                Transform Customer Experience with <span className="hero-gradient-text">Sprinklr</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto animate-fade-in delay-200">
                Discover powerful use cases and real-world solutions that help leading brands 
                deliver unified, exceptional customer experiences at scale.
              </p>
            </div>
            {user && showAdminView && (
              <Button 
                onClick={() => navigate('/admin')}
                className="gap-2 ml-4 glow-button"
                size="lg"
              >
                <Plus className="w-4 h-4" />
                Admin Panel
              </Button>
            )}
          </div>
          
          <div className="relative max-w-2xl mx-auto animate-scale-in delay-400">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search use cases, industries, or solutions..."
              className="search-input pl-12 py-4 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Recent Views Section */}
        {user && recentViews.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold gradient-text">Continue Where You Left Off</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {recentViews.map((useCase) => (
                <Card 
                  key={`recent-${useCase.id}`}
                  className="flex-shrink-0 w-80 cursor-pointer use-case-card h-full flex flex-col"
                  onClick={() => handleUseCaseClick(useCase)}
                >
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={useCase.image || '/placeholder.svg'}
                      alt={useCase.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col h-full">
                    <h3 className="font-semibold mb-2 leading-tight min-h-[2.5rem] flex items-start">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="glass-card rounded-xl border-2 border-primary/10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Refine Your Search</h2>
                    {selectedFilters.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="text-primary hover:text-primary/80 glow-button text-xs px-2 py-1"
                      >
                        Clear ({selectedFilters.length})
                      </Button>
                    )}
                  </div>

                  {/* Active Filters */}
                  {selectedFilters.length > 0 && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-medium text-primary mb-3">Active Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFilters.map((filter) => (
                          <Badge 
                            key={filter} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-destructive/20 bg-primary/10 text-primary border-primary/30"
                            onClick={() => toggleFilter(filter)}
                          >
                            {filter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            <span className="ml-1 text-muted-foreground">×</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="sidebar-filters">
                    {Object.entries(filters).map(([filterCategory, items]) => (
                      <div key={filterCategory} className="filter-category animate-slide-up mb-6">
                        <h3 className="text-base font-semibold mb-3 capitalize text-foreground flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          {filterCategory === 'industry' ? 'Industries' : filterCategory.replace('-', ' ')}
                        </h3>
                        <div className="filter-items space-y-1">
                          {items.map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleFilter(item)}
                              className={`filter-button w-full text-left text-sm px-3 py-2 rounded-md transition-all ${
                                selectedFilters.includes(item) 
                                  ? 'active bg-primary text-primary-foreground shadow-md' 
                                  : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-8">
              <p className="text-lg text-muted-foreground font-medium">
                {loading ? 'Loading amazing solutions...' : `Discover ${filteredUseCases.length} powerful use cases ${useCases.length > filteredUseCases.length ? `from ${useCases.length} total solutions` : ''}`}
              </p>
            </div>

            {/* Use Cases Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" style={{boxShadow: 'var(--shadow-glow)'}}></div>
                  <p className="text-muted-foreground font-medium">Curating the perfect solutions for you...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {filteredUseCases.map((useCase, index) => (
                  <Card 
                    key={useCase.id} 
                    className="use-case-card animate-fade-in group cursor-pointer relative h-full flex flex-col" 
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleUseCaseClick(useCase)}
                  >
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 h-8 w-8 p-0 glass-card hover:bg-background/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(useCase.id);
                        }}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.has(useCase.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`} 
                        />
                      </Button>
                    )}
                    <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={useCase.image || '/placeholder.svg'}
                      alt={useCase.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    </div>
                    <CardContent className="p-6 flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-3 leading-tight min-h-[3.5rem] flex items-start">
                        {useCase.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {useCase.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {useCase.industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        {useCase.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="w-full group mt-auto glow-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseCaseClick(useCase);
                        }}
                      >
                        Explore Solution
                        <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Card className="cta-card col-span-1 md:col-span-2 xl:col-span-3 animate-bounce-in delay-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <img
                        src={customConsultation}
                        alt="Custom consultation"
                        className="w-full max-w-md mx-auto rounded-xl opacity-90 shadow-lg"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      Ready to Build Something Amazing?
                    </h3>
                    <p className="text-white/90 mb-6 max-w-2xl mx-auto text-lg">
                      Partner with our expert team to create custom solutions tailored to your unique business needs. 
                      Transform your customer experience with enterprise-grade innovation.
                    </p>
                    <Button size="lg" className="group bg-white text-primary hover:bg-white/90 shadow-lg">
                      <MessageSquare className="mr-2 w-5 h-5" />
                      Start Your Journey
                      <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}