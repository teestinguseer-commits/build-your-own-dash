import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Edit, Trash2, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UseCase {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  href: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    href: '#',
    image: '/src/assets/support-preview.jpg'
  });

  const categories = [
    'customer-service',
    'automation', 
    'analytics',
    'marketing',
    'engagement'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchUseCases();
    }
  }, [user]);

  const fetchUseCases = async () => {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUseCases(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch use cases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const data = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: tagsArray,
        href: formData.href,
        image: formData.image
      };

      if (editingId) {
        const { error } = await supabase
          .from('use_cases')
          .update(data)
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Use case updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('use_cases')
          .insert([data]);
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Use case created successfully"
        });
      }

      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        href: '#',
        image: '/src/assets/support-preview.jpg'
      });
      setEditingId(null);
      fetchUseCases();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save use case",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (useCase: UseCase) => {
    setFormData({
      title: useCase.title,
      description: useCase.description,
      category: useCase.category,
      tags: useCase.tags.join(', '),
      href: useCase.href,
      image: useCase.image
    });
    setEditingId(useCase.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this use case?')) return;

    try {
      const { error } = await supabase
        .from('use_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Use case deleted successfully"
      });
      fetchUseCases();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete use case",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Use Case' : 'Add New Use Case'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="ai, automation, customer-service"
                  />
                </div>

                <div>
                  <Label htmlFor="href">Link</Label>
                  <Input
                    id="href"
                    value={formData.href}
                    onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image Path</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: '',
                          description: '',
                          category: '',
                          tags: '',
                          href: '#',
                          image: '/src/assets/support-preview.jpg'
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Use Cases List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Use Cases ({useCases.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {useCases.map((useCase) => (
                  <div key={useCase.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{useCase.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(useCase)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(useCase.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary">{useCase.category}</Badge>
                      {useCase.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}