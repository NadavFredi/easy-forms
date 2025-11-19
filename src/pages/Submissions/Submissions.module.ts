import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetFormQuery } from '@/store/api/formsApi';
import { useGetFieldsQuery } from '@/store/api/fieldsApi';
import { useGetSubmissionsQuery } from '@/store/api/submissionsApi';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useSubmissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: form, isLoading: formLoading, error: formError } = useGetFormQuery(id || '', {
    skip: !id,
  });
  const { data: fields = [], isLoading: fieldsLoading } = useGetFieldsQuery(id || '', {
    skip: !id,
  });
  const { data: submissions = [], isLoading: submissionsLoading } = useGetSubmissionsQuery(
    id || '',
    { skip: !id }
  );

  // Check if user owns the form
  useEffect(() => {
    if (form && user && form.user_id !== user.id) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view these submissions',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [form, user, navigate]);

  const dataFields = fields.filter(
    (f) => !['header', 'paragraph', 'link', 'separator'].includes(f.type)
  );

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const exportCSV = () => {
    if (submissions.length === 0) {
      toast({
        title: 'No data',
        description: 'No submissions to export',
      });
      return;
    }

    const headers = dataFields.map((f) => f.label);

    const rows = submissions.map((submission) => {
      return dataFields.map((f) => {
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

  return {
    form,
    fields: dataFields,
    submissions,
    loading: formLoading || fieldsLoading || submissionsLoading,
    formError,
    formatValue,
    exportCSV,
  };
};

