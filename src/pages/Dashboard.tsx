import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Form } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, FileText, Eye, Settings, LogOut, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user]);

  const loadForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createForm = async () => {
    try {
      // Generate a unique slug
      const baseSlug = 'form-' + Date.now().toString(36);
      let slug = baseSlug;
      let attempts = 0;
      
      // Check if slug exists and generate a new one if needed
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('forms')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (!existing) break;
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        attempts++;
      }

      const { data, error } = await supabase
        .from('forms')
        .insert({
          title: 'Untitled Form',
          slug,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/forms/${data.id}/edit`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteForm = async (id: string) => {
    try {
      const { error } = await supabase.from('forms').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
      loadForms();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Easy Forms</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Forms</h2>
            <p className="text-muted-foreground">Create and manage your forms</p>
          </div>
          <Button onClick={createForm} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Get started by creating your first form
              </p>
              <Button onClick={createForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{form.title}</CardTitle>
                  <CardDescription>
                    {form.is_published ? (
                      <span className="text-green-600">Published</span>
                    ) : (
                      <span className="text-muted-foreground">Draft</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/forms/${form.id}/edit`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`/f/${form.slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your form
                            and all its submissions.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteForm(form.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate(`/forms/${form.id}/submissions`)}
                  >
                    View Submissions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

