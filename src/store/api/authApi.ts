import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: async () => ({ data: null }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    getSession: builder.query<{ session: Session | null; user: User | null }, void>({
      queryFn: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) return { error };
        return { data: { session: data.session, user: data.session?.user ?? null } };
      },
    }),
    signIn: builder.mutation<
      { user: User | null; session: Session | null },
      { email: string; password: string }
    >({
      queryFn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error };
        return { data: { user: data.user, session: data.session } };
      },
    }),
    signUp: builder.mutation<
      { user: User | null; session: Session | null },
      { email: string; password: string }
    >({
      queryFn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) return { error };
        return { data: { user: data.user, session: data.session } };
      },
    }),
    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) return { error };
        return { data: undefined };
      },
    }),
  }),
});

export const { useGetSessionQuery, useSignInMutation, useSignUpMutation, useSignOutMutation } =
  authApi;

