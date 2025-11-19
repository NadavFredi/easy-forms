import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetFormBySlugQuery } from '@/store/api/formsApi';
import { useGetFieldsQuery } from '@/store/api/fieldsApi';
import { useCreateSubmissionMutation } from '@/store/api/submissionsApi';
import { useGetWebhooksQuery } from '@/store/api/webhooksApi';
import { FormField } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const useFormView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading: formLoading, error: formError } = useGetFormBySlugQuery(
    slug || '',
    { skip: !slug }
  );
  const { data: fields = [], isLoading: fieldsLoading } = useGetFieldsQuery(form?.id || '', {
    skip: !form?.id,
  });
  const [createSubmissionMutation] = useCreateSubmissionMutation();
  const { data: webhooks = [] } = useGetWebhooksQuery(form?.id || '', {
    skip: !form?.id,
  });

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

          const {
            data: { publicUrl },
          } = supabase.storage.from('form-files').getPublicUrl(filePath);

          submissionData[key] = publicUrl;
        } else {
          submissionData[key] = value;
        }
      }

      // Save submission
      await createSubmissionMutation({
        form_id: form.id,
        data: submissionData,
      }).unwrap();

      // Trigger webhooks
      const activeWebhooks = webhooks.filter((w) => w.is_active);
      for (const webhook of activeWebhooks) {
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
      }

      setSubmitted(true);
      toast({
        title: 'Success',
        description: 'Form submitted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit form',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    fields,
    loading: formLoading || fieldsLoading,
    submitting,
    submitted,
    formError,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    setValue,
    watch,
  };
};

