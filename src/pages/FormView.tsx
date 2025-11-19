import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, Form, FormField } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const FormView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      loadForm();
    }
  }, [slug]);

  const loadForm = async () => {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (formError) throw formError;
      setForm(formData);

      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formData.id)
        .order('order_index', { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Form not found or not published',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Build validation schema
  const buildSchema = () => {
    const schemaObject: Record<string, any> = {};

    fields.forEach((field) => {
      if (['header', 'paragraph', 'link', 'separator'].includes(field.type)) {
        return;
      }

      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address');
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          break;
        case 'url':
          fieldSchema = z.string().url('Invalid URL');
          break;
        case 'tel':
          fieldSchema = z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number');
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        case 'multiselect':
          fieldSchema = z.array(z.string());
          break;
        case 'file':
          fieldSchema = z.instanceof(FileList).optional();
          break;
        default:
          fieldSchema = z.string();
      }

      if (field.required && field.type !== 'checkbox') {
        fieldSchema = fieldSchema.min(1, 'This field is required');
      }

      schemaObject[field.id] = fieldSchema;
    });

    return z.object(schemaObject);
  };

  const schema = buildSchema();
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!form) return;

    setSubmitting(true);
    try {
      // Handle file uploads
      const submissionData: Record<string, any> = {};

      for (const [key, value] of Object.entries(data)) {
        const field = fields.find((f) => f.id === key);
        if (field?.type === 'file' && value instanceof FileList && value.length > 0) {
          // Upload file to Supabase Storage
          const file = value[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `form-uploads/${form.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('form-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('form-files')
            .getPublicUrl(filePath);

          submissionData[key] = publicUrl;
        } else {
          submissionData[key] = value;
        }
      }

      // Save submission
      const { error: submitError } = await supabase
        .from('submissions')
        .insert({
          form_id: form.id,
          data: submissionData,
        });

      if (submitError) throw submitError;

      // Trigger webhooks
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('*')
        .eq('form_id', form.id)
        .eq('is_active', true);

      if (webhooks && webhooks.length > 0) {
        // Trigger webhooks asynchronously (in production, use a background job)
        webhooks.forEach(async (webhook) => {
          try {
            await fetch(webhook.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
              },
              body: JSON.stringify({
                form_id: form.id,
                form_title: form.title,
                submission: submissionData,
                submitted_at: new Date().toISOString(),
              }),
            });
          } catch (error) {
            console.error('Webhook error:', error);
          }
        });
      }

      setSubmitted(true);
      toast({
        title: 'Success',
        description: 'Form submitted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              rows={4}
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              onValueChange={(value) => setValue(field.id, value)}
              {...register(field.id)}
            >
              <SelectTrigger id={field.id}>
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
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
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
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
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
              <Label htmlFor={field.id} className="font-normal">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
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
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'time':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="time"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.id} className={cn('space-y-2', widthClasses[field.width])}>
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="datetime-local"
              {...register(field.id)}
            />
            {errors[field.id] && (
              <p className="text-sm text-destructive">{errors[field.id]?.message as string}</p>
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

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
            <CardDescription>The form you're looking for doesn't exist or isn't published.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground text-center">
              Your submission has been received successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-base">{form.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => renderField(field))}
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormView;

