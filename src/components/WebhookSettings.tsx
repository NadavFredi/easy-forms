import { useEffect, useState } from 'react';
import { supabase, Webhook } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
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

interface WebhookSettingsProps {
  formId: string;
}

const WebhookSettings = ({ formId }: WebhookSettingsProps) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookSecret, setNewWebhookSecret] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, [formId]);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
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

  const addWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a webhook URL',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          form_id: formId,
          url: newWebhookUrl.trim(),
          secret: newWebhookSecret.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setWebhooks([data, ...webhooks]);
      setNewWebhookUrl('');
      setNewWebhookSecret('');
      toast({
        title: 'Success',
        description: 'Webhook added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !isActive })
        .eq('id', webhookId);

      if (error) throw error;
      setWebhooks(
        webhooks.map((w) => (w.id === webhookId ? { ...w, is_active: !isActive } : w))
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase.from('webhooks').delete().eq('id', webhookId);

      if (error) throw error;
      setWebhooks(webhooks.filter((w) => w.id !== webhookId));
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks</CardTitle>
        <CardDescription>
          Receive notifications when forms are submitted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            placeholder="https://example.com/webhook"
            type="url"
          />
        </div>
        <div className="space-y-2">
          <Label>Secret (Optional)</Label>
          <Input
            value={newWebhookSecret}
            onChange={(e) => setNewWebhookSecret(e.target.value)}
            placeholder="Webhook secret"
            type="password"
          />
        </div>
        <Button onClick={addWebhook} disabled={adding} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {adding ? 'Adding...' : 'Add Webhook'}
        </Button>

        <div className="space-y-2 pt-4 border-t">
          {webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No webhooks configured
            </p>
          ) : (
            webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={webhook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline flex items-center gap-1 truncate"
                    >
                      {webhook.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={() => toggleWebhook(webhook.id, webhook.is_active)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {webhook.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this webhook.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;

