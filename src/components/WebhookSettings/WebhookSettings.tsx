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
        <CardDescription>קבל התראות כאשר טפסים מוגשים</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>כתובת Webhook</Label>
          <Input
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            placeholder="https://example.com/webhook"
            type="url"
          />
        </div>
        <div className="space-y-2">
          <Label>סוד (אופציונלי)</Label>
          <Input
            value={newWebhookSecret}
            onChange={(e) => setNewWebhookSecret(e.target.value)}
            placeholder="סוד webhook"
            type="password"
          />
        </div>
        <Button onClick={addWebhook} disabled={isAdding} className="w-full">
          <Plus className="h-4 w-4 ml-2" />
          {isAdding ? 'מוסיף...' : 'הוסף Webhook'}
        </Button>

        <div className="space-y-2 pt-4 border-t">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">טוען...</p>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              אין webhooks מוגדרים
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
                      {webhook.is_active ? 'פעיל' : 'לא פעיל'}
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
                      <AlertDialogTitle>למחוק Webhook?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו לא ניתנת לביטול. זה ימחק לצמיתות את ה-webhook הזה.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>
                        מחק
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

