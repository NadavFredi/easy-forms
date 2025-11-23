import { FormField, FieldType } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface FieldEditorProps {
  field: FormField;
  onChange: (field: Partial<FormField>) => void;
}

const FieldEditor = ({ field, onChange }: FieldEditorProps) => {
  const isContentField = ['header', 'paragraph', 'link', 'separator'].includes(field.type);
  const hasOptions = ['select', 'multiselect', 'radio'].includes(field.type);
  const hasPlaceholder = !isContentField && field.type !== 'checkbox';

  const updateOptions = (index: number, value: string) => {
    const options = field.options?.options || [];
    options[index] = value;
    onChange({ options: { ...field.options, options } });
  };

  const addOption = () => {
    const options = field.options?.options || [];
    onChange({ options: { ...field.options, options: [...options, ''] } });
  };

  const removeOption = (index: number) => {
    const options = field.options?.options || [];
    onChange({ options: { ...field.options, options: options.filter((_, i) => i !== index) } });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="space-y-2">
        <Label>סוג שדה</Label>
        <Select
          value={field.type}
          onValueChange={(value) => onChange({ type: value as FieldType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">קלט טקסט</SelectItem>
            <SelectItem value="email">אימייל</SelectItem>
            <SelectItem value="number">מספר</SelectItem>
            <SelectItem value="textarea">אזור טקסט</SelectItem>
            <SelectItem value="select">בחירה</SelectItem>
            <SelectItem value="multiselect">בחירה מרובה</SelectItem>
            <SelectItem value="checkbox">תיבת סימון</SelectItem>
            <SelectItem value="radio">רדיו</SelectItem>
            <SelectItem value="file">העלאת קובץ</SelectItem>
            <SelectItem value="date">תאריך</SelectItem>
            <SelectItem value="time">שעה</SelectItem>
            <SelectItem value="datetime">תאריך ושעה</SelectItem>
            <SelectItem value="url">קישור</SelectItem>
            <SelectItem value="tel">טלפון</SelectItem>
            <SelectItem value="password">סיסמה</SelectItem>
            <SelectItem value="header">כותרת</SelectItem>
            <SelectItem value="paragraph">פסקה</SelectItem>
            <SelectItem value="link">קישור חיצוני</SelectItem>
            <SelectItem value="separator">מפריד</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isContentField && (
        <div className="space-y-2">
          <Label>תווית</Label>
          <Input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="תווית שדה"
          />
        </div>
      )}

      {field.type === 'header' && (
        <div className="space-y-2">
          <Label>טקסט כותרת</Label>
          <Input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="טקסט כותרת"
          />
        </div>
      )}

      {field.type === 'paragraph' && (
        <div className="space-y-2">
          <Label>טקסט פסקה</Label>
          <Textarea
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="טקסט פסקה"
            rows={4}
          />
        </div>
      )}

      {field.type === 'link' && (
        <>
          <div className="space-y-2">
            <Label>טקסט קישור</Label>
            <Input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="טקסט קישור"
            />
          </div>
          <div className="space-y-2">
            <Label>כתובת URL</Label>
            <Input
              value={field.options?.url || ''}
              onChange={(e) => onChange({ options: { ...field.options, url: e.target.value } })}
              placeholder="https://example.com"
            />
          </div>
        </>
      )}

      {hasPlaceholder && (
        <div className="space-y-2">
          <Label>טקסט מקום</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="טקסט מקום"
          />
        </div>
      )}

      {hasOptions && (
        <div className="space-y-2">
          <Label>אפשרויות</Label>
          {(field.options?.options || []).map((option: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => updateOptions(index, e.target.value)}
                placeholder={`אפשרות ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף אפשרות
          </Button>
        </div>
      )}

      {!isContentField && (
        <div className="flex items-center space-x-2">
          <Switch
            id="required"
            checked={field.required}
            onCheckedChange={(checked) => onChange({ required: checked })}
          />
          <Label htmlFor="required">חובה</Label>
        </div>
      )}

      <div className="space-y-2">
        <Label>רוחב</Label>
        <Select
          value={field.width}
          onValueChange={(value: any) => onChange({ width: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">רוחב מלא</SelectItem>
            <SelectItem value="half">חצי רוחב</SelectItem>
            <SelectItem value="third">שליש רוחב</SelectItem>
            <SelectItem value="quarter">רבע רוחב</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FieldEditor;
