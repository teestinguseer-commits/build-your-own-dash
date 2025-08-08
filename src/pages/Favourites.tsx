import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { toast } from '@/components/ui/sonner';

interface UseCase {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  industry: string;
  href: string;
}

export default function Favourites() {
  const [favorites, setFavorites] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data: favRows, error } = await (supabase as any)
        .from('user_favorites')
        .select('use_case_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ids = (favRows || []).map((r: any) => r.use_case_id).filter(Boolean);
      if (!ids.length) { setFavorites([]); return; }

      const { data: cases, error: ucError } = await supabase
        .from('use_cases')
        .select('*')
        .in('id', ids);

      if (ucError) throw ucError;

      const byId = new Map((cases || []).map((c: any) => [c.id, c]));
      const favoriteUseCases = ids
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
      
      setFavorites(favoriteUseCases as any);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (useCaseId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('use_case_id', useCaseId);
      
      if (error) throw error;
      
      setFavorites(prev => prev.filter(f => f.id !== useCaseId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const trackView = async (useCaseId: string) => {
    if (!user) return;
    
    try {
      await (supabase as any).rpc('update_recent_view', {
        p_user_id: user.id,
        p_use_case_id: useCaseId
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleUseCaseClick = (useCase: UseCase) => {
    trackView(useCase.id);
    window.open(useCase.href, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Use Cases
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-4xl font-bold">Your Favorites</h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {favorites.length}
          </Badge>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative">
                <Heart className="w-24 h-24 text-muted-foreground/30 mx-auto" />
                <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-muted-foreground">
                  No favorites yet
                </h2>
                <p className="text-muted-foreground">
                  Start exploring use cases and click the heart icon to save your favorites here.
                </p>
              </div>
              
              <div className="space-y-4 pt-4">
                <Button 
                  onClick={() => navigate('/')}
                  size="lg"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Use Cases
                </Button>
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium">💡 Pro tip:</p>
                  <p>Favorited use cases help you quickly access the solutions most relevant to your needs!</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((useCase, index) => (
              <Card 
                key={useCase.id}
                className="use-case-card animate-fade-in group cursor-pointer relative h-full flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleUseCaseClick(useCase)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(useCase.id);
                  }}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
                
                <div className="aspect-video overflow-hidden rounded-t-xl">
                  <img
                    src={useCase.image}
                    alt={useCase.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                <CardContent className="p-6 flex flex-col h-full">
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
                    className="w-full group mt-auto" 
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
          </div>
        )}
      </div>
    </div>
  );
}