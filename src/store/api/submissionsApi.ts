import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { Submission } from '@/lib/supabase';

export const submissionsApi = createApi({
  reducerPath: 'submissionsApi',
  baseQuery: async () => ({ data: null }),
  tagTypes: ['Submissions'],
  endpoints: (builder) => ({
    getSubmissions: builder.query<Submission[], string>({
      queryFn: async (formId) => {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('form_id', formId)
          .order('submitted_at', { ascending: false });
        if (error) return { error };
        return { data: data || [] };
      },
      providesTags: (result, error, formId) => [{ type: 'Submissions', id: formId }],
    }),
    createSubmission: builder.mutation<
      Submission,
      { form_id: string; data: Record<string, any> }
    >({
      queryFn: async (submissionData) => {
        const { data, error } = await supabase
          .from('submissions')
          .insert(submissionData)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { form_id }) => [{ type: 'Submissions', id: form_id }],
    }),
  }),
});

export const { useGetSubmissionsQuery, useCreateSubmissionMutation } = submissionsApi;

