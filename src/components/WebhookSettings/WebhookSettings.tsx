import { useWebhookSettings } from './WebhookSettings.module';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ExternalLink, Plus } from 'lucide-react';
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
  const {
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
  } = useWebhookSettings(formId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks</CardTitle>
        <CardDescription>Receive notifications when forms are submitted</CardDescription>
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
        <Button onClick={addWebhook} disabled={isAdding} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {isAdding ? 'Adding...' : 'Add Webhook'}
        </Button>

        <div className="space-y-2 pt-4 border-t">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : webhooks.length === 0 ? (
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

