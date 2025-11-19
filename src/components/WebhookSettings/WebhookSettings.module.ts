import { useState } from 'react';
import {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
} from '@/store/api/webhooksApi';
import { toast } from '@/hooks/use-toast';

export const useWebhookSettings = (formId: string) => {
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookSecret, setNewWebhookSecret] = useState('');

  const { data: webhooks = [], isLoading } = useGetWebhooksQuery(formId, { skip: !formId });
  const [createWebhookMutation, { isLoading: isAdding }] = useCreateWebhookMutation();
  const [updateWebhookMutation] = useUpdateWebhookMutation();
  const [deleteWebhookMutation] = useDeleteWebhookMutation();

  const addWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a webhook URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createWebhookMutation({
        form_id: formId,
        url: newWebhookUrl.trim(),
        secret: newWebhookSecret.trim() || undefined,
        is_active: true,
      }).unwrap();

      setNewWebhookUrl('');
      setNewWebhookSecret('');
      toast({
        title: 'Success',
        description: 'Webhook added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add webhook',
        variant: 'destructive',
      });
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      await updateWebhookMutation({
        id: webhookId,
        is_active: !isActive,
      }).unwrap();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update webhook',
        variant: 'destructive',
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhookMutation({ id: webhookId, form_id: formId }).unwrap();
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete webhook',
        variant: 'destructive',
      });
    }
  };

  return {
    webhooks,
    isLoading,
    newWebhookUrl,
    setNewWebhookUrl,
    newWebhookSecret,
    setNewWebhookSecret,
    addWebhook,
    toggleWebhook,
    deleteWebhook,
    isAdding,
  };
};

