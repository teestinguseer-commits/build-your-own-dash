import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, MessageSquare, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  category: string;
  href: string;
}

const filters = {
  category: ["customer-service", "automation", "analytics", "marketing", "engagement"],
  features: ["ai", "real-time", "automation", "collaboration", "reporting"],
  platforms: ["social-media", "web", "mobile", "api", "chatbots"]
};

export default function UseCasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUseCases();
  }, []);

  const fetchUseCases = async () => {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUseCases(data || []);
    } catch (error) {
      console.error('Error fetching use cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUseCases = useMemo(() => {
    return useCases.filter(useCase => {
      const matchesSearch = useCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           useCase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           useCase.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedFilters.length === 0) return matchesSearch;

      const matchesFilters = selectedFilters.some(filter => 
        useCase.category === filter ||
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
      <Header />
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
            {user && (
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

              {Object.entries(filters).map(([category, items]) => (
                <div key={category} className="animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {category.replace('-', ' ')}
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
                    className="use-case-card animate-fade-in group cursor-pointer" 
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => window.open(useCase.href, '_blank')}
                  >
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
                          {useCase.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                          window.open(useCase.href, '_blank');
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