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
        <Label>Field Type</Label>
        <Select
          value={field.type}
          onValueChange={(value) => onChange({ type: value as FieldType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Input</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="textarea">Textarea</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="multiselect">Multi-Select</SelectItem>
            <SelectItem value="checkbox">Checkbox</SelectItem>
            <SelectItem value="radio">Radio</SelectItem>
            <SelectItem value="file">File Upload</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="time">Time</SelectItem>
            <SelectItem value="datetime">Date & Time</SelectItem>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="tel">Phone</SelectItem>
            <SelectItem value="password">Password</SelectItem>
            <SelectItem value="header">Header</SelectItem>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="separator">Separator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isContentField && (
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Field label"
          />
        </div>
      )}

      {field.type === 'header' && (
        <div className="space-y-2">
          <Label>Header Text</Label>
          <Input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Header text"
          />
        </div>
      )}

      {field.type === 'paragraph' && (
        <div className="space-y-2">
          <Label>Paragraph Text</Label>
          <Textarea
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Paragraph text"
            rows={4}
          />
        </div>
      )}

      {field.type === 'link' && (
        <>
          <div className="space-y-2">
            <Label>Link Text</Label>
            <Input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="Link text"
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
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
          <Label>Placeholder</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Placeholder text"
          />
        </div>
      )}

      {hasOptions && (
        <div className="space-y-2">
          <Label>Options</Label>
          {(field.options?.options || []).map((option: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => updateOptions(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
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
            <Plus className="h-4 w-4 mr-2" />
            Add Option
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
          <Label htmlFor="required">Required</Label>
        </div>
      )}

      <div className="space-y-2">
        <Label>Width</Label>
        <Select
          value={field.width}
          onValueChange={(value: any) => onChange({ width: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Width</SelectItem>
            <SelectItem value="half">Half Width</SelectItem>
            <SelectItem value="third">Third Width</SelectItem>
            <SelectItem value="quarter">Quarter Width</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FieldEditor;

