import { FormField } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FieldPreviewProps {
  field: FormField;
}

const FieldPreview = ({ field }: FieldPreviewProps) => {
  const widthClasses = {
    full: 'w-full',
    half: 'w-1/2',
    third: 'w-1/3',
    quarter: 'w-1/4',
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'password':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
            disabled
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            required={field.required}
            disabled
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            required={field.required}
            disabled
            rows={4}
          />
        );

      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {(field.options?.options || []).map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {(field.options?.options || []).map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${index}`} disabled />
                <Label htmlFor={`${field.id}-${index}`} className="font-normal break-words break-all">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.id} required={field.required} disabled />
            <Label htmlFor={field.id} className="font-normal break-words break-all">
              {field.label}
            </Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup disabled>
            {(field.options?.options || []).map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="font-normal break-words break-all">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'file':
        return (
          <Input
            type="file"
            required={field.required}
            disabled
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            required={field.required}
            disabled
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            required={field.required}
            disabled
          />
        );

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            required={field.required}
            disabled
          />
        );

      case 'header':
        return (
          <h2 className="text-2xl font-bold break-words break-all">{field.label}</h2>
        );

      case 'paragraph':
        return (
          <p className="text-muted-foreground whitespace-pre-wrap break-words break-all">{field.label}</p>
        );

      case 'link':
        return (
          <a
            href={field.options?.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-words break-all"
          >
            {field.label}
          </a>
        );

      case 'separator':
        return <Separator />;

      default:
        return null;
    }
  };

  if (['header', 'paragraph', 'link', 'separator'].includes(field.type)) {
    return (
      <div className={cn('py-2 w-full overflow-hidden', widthClasses[field.width])}>
        {renderField()}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 py-2 w-full', widthClasses[field.width])}>
      <Label className="break-words break-all">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
};

export default FieldPreview;

