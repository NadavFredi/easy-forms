import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { FormField } from '@/lib/supabase';

export const fieldsApi = createApi({
  reducerPath: 'fieldsApi',
  baseQuery: async () => ({ data: null }),
  tagTypes: ['Fields'],
  endpoints: (builder) => ({
    getFields: builder.query<FormField[], string>({
      queryFn: async (formId) => {
        const { data, error } = await supabase
          .from('form_fields')
          .select('*')
          .eq('form_id', formId)
          .order('row', { ascending: true })
          .order('order_index', { ascending: true });
        if (error) return { error };
        return { data: data || [] };
      },
      providesTags: (result, error, formId) => [{ type: 'Fields', id: formId }],
    }),
    createField: builder.mutation<FormField, Omit<FormField, 'id' | 'created_at'>>({
      queryFn: async (fieldData) => {
        const { data, error } = await supabase
          .from('form_fields')
          .insert(fieldData)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, field) => [{ type: 'Fields', id: field.form_id }],
    }),
    updateField: builder.mutation<FormField, Partial<FormField> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        const { data, error } = await supabase
          .from('form_fields')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, field) => [{ type: 'Fields', id: field.form_id }],
    }),
    deleteField: builder.mutation<void, { id: string; form_id: string }>({
      queryFn: async ({ id }) => {
        const { error } = await supabase.from('form_fields').delete().eq('id', id);
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: (result, error, { form_id }) => [{ type: 'Fields', id: form_id }],
    }),
    updateFieldsOrder: builder.mutation<
      FormField[],
      { formId: string; fields: Array<{ id: string; order_index: number }> }
    >({
      queryFn: async ({ formId, fields }) => {
        const updates = fields.map((field) =>
          supabase
            .from('form_fields')
            .update({ order_index: field.order_index })
            .eq('id', field.id)
        );
        const results = await Promise.all(updates);
        const error = results.find((r) => r.error)?.error;
        if (error) return { error };
        const { data } = await supabase
          .from('form_fields')
          .select('*')
          .eq('form_id', formId)
          .order('order_index', { ascending: true });
        return { data: data || [] };
      },
      invalidatesTags: (result, error, { formId }) => [{ type: 'Fields', id: formId }],
    }),
  }),
});

export const {
  useGetFieldsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
  useUpdateFieldsOrderMutation,
} = fieldsApi;

