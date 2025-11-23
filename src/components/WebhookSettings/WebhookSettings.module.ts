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
        title: 'שגיאה',
        description: 'אנא הזן כתובת webhook',
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
        title: 'הצלחה',
        description: 'Webhook נוסף בהצלחה',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message || 'נכשל בהוספת webhook',
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
        title: 'שגיאה',
        description: error.message || 'נכשל בעדכון webhook',
        variant: 'destructive',
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhookMutation({ id: webhookId, form_id: formId }).unwrap();
      toast({
        title: 'הצלחה',
        description: 'Webhook נמחק בהצלחה',
      });
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message || 'נכשל במחיקת webhook',
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

