import { useNavigate } from 'react-router-dom';
import { useSubmissions } from './Submissions.module';
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
import WebhookSettings from '@/components/WebhookSettings/WebhookSettings';
import Logo from '@/components/Logo';

const Submissions = () => {
  const navigate = useNavigate();
  const { form, fields, submissions, loading, formError, formatValue, exportCSV } = useSubmissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">טוען...</div>
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
              <Logo showText={false} height={32} />
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזור
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{form.title}</h1>
                <p className="text-sm text-muted-foreground">הגשות</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 ml-2" />
                ייצא CSV
              </Button>
              <Button variant="outline" onClick={() => navigate(`/forms/${form.id}/edit`)}>
                <Settings className="h-4 w-4 ml-2" />
                ערוך טופס
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
                <CardTitle>הגשות ({submissions.length})</CardTitle>
                <CardDescription>צפה בכל הגשות הטופס</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>אין עדיין הגשות</p>
                    <p className="text-sm mt-2">שתף את הטופס שלך כדי להתחיל לקבל הגשות</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך</TableHead>
                          {fields.map((field) => (
                            <TableHead key={field.id}>{field.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              {new Date(submission.submitted_at).toLocaleString('he-IL')}
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

