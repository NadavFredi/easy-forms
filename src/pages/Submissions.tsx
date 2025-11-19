import { useNavigate } from 'react-router-dom';
import { useSubmissions } from '@/hooks/useSubmissions';
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
import WebhookSettings from '@/components/WebhookSettings';

const Submissions = () => {
  const navigate = useNavigate();
  const { form, fields, submissions, loading, formError, formatValue, exportCSV } = useSubmissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (formError || !form) {
    return null;
  }

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
                          {fields.map((field) => (
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
                            {fields.map((field) => (
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
