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
      const updatedUseCases = (data || []).map(useCase => ({
        ...useCase,
        industry: useCase.category, // Map category to industry
        href: useCase.href.startsWith('#') ? 
          `https://help.sprinklr.com/hc/en-us/articles/${Math.floor(Math.random() * 1000000000)}-${useCase.title.toLowerCase().replace(/\s+/g, '-')}` : 
          useCase.href,
        image: useCase.image.startsWith('/src/') ? 
          useCase.image.replace('/src/', '/') : 
          useCase.image
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
        .from('user_recent_views')
        .select(`
          use_case_id,
          viewed_at,
          use_cases (*)
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const recentUseCases = data
        .filter(rv => rv.use_cases)
        .map(rv => ({
          ...rv.use_cases,
          industry: rv.use_cases.category,
          href: rv.use_cases.href.startsWith('#') ? 
            `https://help.sprinklr.com/hc/en-us/articles/${Math.floor(Math.random() * 1000000000)}-${rv.use_cases.title.toLowerCase().replace(/\s+/g, '-')}` : 
            rv.use_cases.href,
          image: rv.use_cases.image.startsWith('/src/') ? 
            rv.use_cases.image.replace('/src/', '/') : 
            rv.use_cases.image
        }));
      
      setRecentViews(recentUseCases);
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
        const { error } = await supabase
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
        const { error } = await supabase
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
      const { error } = await supabase.rpc('update_recent_view', {
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
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
                Sprinklr Use Cases
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto animate-fade-in delay-200">
                Discover how Sprinklr's unified customer experience management platform helps brands 
                deliver exceptional experiences across all digital touchpoints.
              </p>
            </div>
            {user && showAdminView && (
              <Button 
                onClick={() => navigate('/admin')}
                className="gap-2 ml-4"
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
              placeholder="Search use cases..."
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
              <h2 className="text-2xl font-bold">Recently Viewed</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {recentViews.map((useCase) => (
                <Card 
                  key={`recent-${useCase.id}`}
                  className="flex-shrink-0 w-80 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleUseCaseClick(useCase)}
                >
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={useCase.image}
                      alt={useCase.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{useCase.title}</h3>
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Filters</h2>
                {selectedFilters.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear all ({selectedFilters.length})
                  </Button>
                )}
              </div>

              {Object.entries(filters).map(([filterCategory, items]) => (
                <div key={filterCategory} className="animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {filterCategory === 'industry' ? 'Industry' : filterCategory.replace('-', ' ')}
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleFilter(item)}
                        className={`filter-button w-full text-left ${
                          selectedFilters.includes(item) ? 'active' : ''
                        }`}
                      >
                        {item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-8">
              <p className="text-lg text-muted-foreground">
                {loading ? 'Loading...' : `Showing ${filteredUseCases.length} of ${useCases.length} use cases`}
              </p>
            </div>

            {/* Use Cases Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading use cases...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {filteredUseCases.map((useCase, index) => (
                  <Card 
                    key={useCase.id} 
                    className="use-case-card animate-fade-in group cursor-pointer relative" 
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleUseCaseClick(useCase)}
                  >
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-background/80 hover:bg-background"
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
                        src={useCase.image}
                        alt={useCase.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">
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
                        className="w-full group" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseCaseClick(useCase);
                        }}
                      >
                        Learn more 
                        <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Custom CTA Card */}
                <Card className="cta-card col-span-1 md:col-span-2 xl:col-span-3 animate-bounce-in delay-600">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <img
                        src={customConsultation}
                        alt="Custom consultation"
                        className="w-full max-w-md mx-auto rounded-xl opacity-80"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">
                      Have a custom use case for Sprinklr?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Let's discuss your specific customer experience requirements and build something amazing together.
                      Our engineering team is ready to help you create the perfect solution.
                    </p>
                    <Button size="lg" className="group">
                      <MessageSquare className="mr-2 w-5 h-5" />
                      Talk to our Engineering Team
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