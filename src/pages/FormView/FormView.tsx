import { useFormView } from './FormView.module';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FormField } from '@/lib/supabase';
import Logo from '@/components/Logo';

const FormView = () => {
  const {
    form,
    fields,
    loading,
    submitting,
    submitted,
    formError,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
  } = useFormView();

  const renderField = (field: FormField) => {
    const widthClasses = {
      full: 'w-full',
      half: 'w-1/2',
      third: 'w-1/3',
      quarter: 'w-1/4',
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'password':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              rows={4}
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Select
              onValueChange={(value) => setValue(field.id, value)}
              {...register(field.id)}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder || 'בחר אפשרות'} />
              </SelectTrigger>
              <SelectContent>
                {(field.options?.options || []).map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <div className="space-y-2">
              {(field.options?.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={(watch(field.id) as string[] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const current = (watch(field.id) as string[]) || [];
                      if (checked) {
                        setValue(field.id, [...current, option]);
                      } else {
                        setValue(field.id, current.filter((v) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                {...register(field.id)}
              />
              <Label htmlFor={field.id} className="font-normal text-right">
                {field.label}
                {field.required && <span className="text-destructive mr-1">*</span>}
              </Label>
            </div>
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <RadioGroup
              onValueChange={(value) => setValue(field.id, value)}
              {...register(field.id)}
            >
              {(field.options?.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'time':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="time"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id} className="text-right">
              {field.label}
              {field.required && <span className="text-destructive mr-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="datetime-local"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive text-right">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'header':
        return (
          <div key={field.id} className={cn('py-2', widthClasses[field.width])}>
            <h2 className="text-2xl font-bold">{field.label}</h2>
          </div>
        );

      case 'paragraph':
        return (
          <div key={field.id} className={cn('py-2', widthClasses[field.width])}>
            <p className="text-muted-foreground whitespace-pre-wrap">{field.label}</p>
          </div>
        );

      case 'link':
        return (
          <div key={field.id} className={cn('py-2', widthClasses[field.width])}>
            <a
              href={field.options?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {field.label}
            </a>
          </div>
        );

      case 'separator':
        return (
          <div key={field.id} className={cn('py-2', widthClasses[field.width])}>
            <Separator />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>טופס לא נמצא</CardTitle>
            <CardDescription>הטופס שאתה מחפש לא קיים או לא פורסם.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <Logo />
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">תודה רבה!</h2>
            <p className="text-muted-foreground text-center">
              ההגשה שלך התקבלה בהצלחה.
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-accent/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <Logo />
        </div>
      </nav>
      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-base">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => renderField(field))}
              </div>
              <div className="flex justify-start pt-4">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    'שלח'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default FormView;

