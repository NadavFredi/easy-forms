import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { Form } from '@/lib/supabase';

export const formsApi = createApi({
  reducerPath: 'formsApi',
  baseQuery: async () => ({ data: null }),
  tagTypes: ['Form', 'Forms'],
  endpoints: (builder) => ({
    getForms: builder.query<Form[], string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) return { error };
        return { data: data || [] };
      },
      providesTags: ['Forms'],
    }),
    getForm: builder.query<Form, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('id', id)
          .single();
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, id) => [{ type: 'Form', id }],
    }),
    getFormBySlug: builder.query<Form, string>({
      queryFn: async (slug) => {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();
        if (error) return { error };
        return { data };
      },
    }),
    createForm: builder.mutation<Form, { title: string; slug: string; user_id: string }>({
      queryFn: async (formData) => {
        const { data, error } = await supabase
          .from('forms')
          .insert(formData)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Forms'],
    }),
    updateForm: builder.mutation<
      Form,
      { id: string; title?: string; description?: string; slug?: string; is_published?: boolean }
    >({
      queryFn: async ({ id, ...updates }) => {
        const { data, error } = await supabase
          .from('forms')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Form', id },
        'Forms',
      ],
    }),
    deleteForm: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('forms').delete().eq('id', id);
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ['Forms'],
    }),
  }),
});

export const {
  useGetFormsQuery,
  useGetFormQuery,
  useGetFormBySlugQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
} = formsApi;

