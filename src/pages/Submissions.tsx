import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Form, Submission, FormField } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import WebhookSettings from '@/components/WebhookSettings';

const Submissions = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      loadData();
    }
  }, [id, user]);

  const loadData = async () => {
    try {
      // Load form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (formError) throw formError;
      setForm(formData);

      // Load fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);

      // Load submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('form_id', id)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (submissions.length === 0) {
      toast({
        title: 'No data',
        description: 'No submissions to export',
      });
      return;
    }

    const headers = fields
      .filter((f) => !['header', 'paragraph', 'link', 'separator'].includes(f.type))
      .map((f) => f.label);

    const rows = submissions.map((submission) => {
      return fields
        .filter((f) => !['header', 'paragraph', 'link', 'separator'].includes(f.type))
        .map((f) => {
          const value = submission.data[f.id];
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value || '';
        });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form?.title || 'submissions'}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'CSV exported successfully',
    });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  const dataFields = fields.filter(
    (f) => !['header', 'paragraph', 'link', 'separator'].includes(f.type)
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{form.title}</h1>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => navigate(`/forms/${form.id}/edit`)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Form
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submissions ({submissions.length})</CardTitle>
                <CardDescription>View all form submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No submissions yet</p>
                    <p className="text-sm mt-2">Share your form to start receiving submissions</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          {dataFields.map((field) => (
                            <TableHead key={field.id}>{field.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              {new Date(submission.submitted_at).toLocaleString()}
                            </TableCell>
                            {dataFields.map((field) => (
                              <TableCell key={field.id}>
                                {formatValue(submission.data[field.id])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <WebhookSettings formId={form.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submissions;

