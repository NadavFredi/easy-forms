import { useNavigate } from 'react-router-dom';
import {
  useGetFormsQuery,
  useCreateFormMutation,
  useDeleteFormMutation,
} from '@/store/api/formsApi';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: forms = [], isLoading, error } = useGetFormsQuery(user?.id || '', {
    skip: !user?.id,
  });
  const [createFormMutation, { isLoading: isCreating }] = useCreateFormMutation();
  const [deleteFormMutation] = useDeleteFormMutation();

  const createForm = async () => {
    if (!user?.id) return;

    try {
      // Generate a unique slug
      const baseSlug = 'form-' + Date.now().toString(36);
      let slug = baseSlug;
      let attempts = 0;

      // Check if slug exists and generate a new one if needed
      while (attempts < 10) {
        const existing = forms.find((f) => f.slug === slug);
        if (!existing) break;
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        attempts++;
      }

      const form = await createFormMutation({
        title: 'Untitled Form',
        slug,
        user_id: user.id,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Form created successfully',
      });

      navigate(`/forms/${form.id}/edit`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create form',
        variant: 'destructive',
      });
    }
  };

  const deleteForm = async (id: string) => {
    try {
      await deleteFormMutation(id).unwrap();
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete form',
        variant: 'destructive',
      });
    }
  };

  return {
    forms,
    isLoading,
    error,
    createForm,
    deleteForm,
    isCreating,
  };
};

