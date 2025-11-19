import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { Webhook } from '@/lib/supabase';

export const webhooksApi = createApi({
  reducerPath: 'webhooksApi',
  baseQuery: async () => ({ data: null }),
  tagTypes: ['Webhooks'],
  endpoints: (builder) => ({
    getWebhooks: builder.query<Webhook[], string>({
      queryFn: async (formId) => {
        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('form_id', formId)
          .order('created_at', { ascending: false });
        if (error) return { error };
        return { data: data || [] };
      },
      providesTags: (result, error, formId) => [{ type: 'Webhooks', id: formId }],
    }),
    createWebhook: builder.mutation<
      Webhook,
      { form_id: string; url: string; secret?: string; is_active?: boolean }
    >({
      queryFn: async (webhookData) => {
        const { data, error } = await supabase
          .from('webhooks')
          .insert(webhookData)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { form_id }) => [{ type: 'Webhooks', id: form_id }],
    }),
    updateWebhook: builder.mutation<
      Webhook,
      { id: string; url?: string; secret?: string; is_active?: boolean }
    >({
      queryFn: async ({ id, ...updates }) => {
        const { data, error } = await supabase
          .from('webhooks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, webhook) => ['Webhooks'],
    }),
    deleteWebhook: builder.mutation<void, { id: string; form_id: string }>({
      queryFn: async ({ id }) => {
        const { error } = await supabase.from('webhooks').delete().eq('id', id);
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: (result, error, { form_id }) => [{ type: 'Webhooks', id: form_id }],
    }),
  }),
});

export const {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
} = webhooksApi;

