import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, setSession, setLoading } from '@/store/slices/authSlice';
import { useGetSessionQuery, useSignInMutation, useSignUpMutation, useSignOutMutation } from '@/store/api/authApi';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, session, loading } = useAppSelector((state) => state.auth);
  const { data: sessionData, isLoading: sessionLoading } = useGetSessionQuery();
  const [signInMutation, { isLoading: signInLoading }] = useSignInMutation();
  const [signUpMutation, { isLoading: signUpLoading }] = useSignUpMutation();
  const [signOutMutation] = useSignOutMutation();

  // Initialize session on mount
  useEffect(() => {
    if (sessionData) {
      dispatch(setSession(sessionData.session));
      dispatch(setUser(sessionData.user));
      dispatch(setLoading(false));
    }
  }, [sessionData, dispatch]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
      dispatch(setUser(session?.user ?? null));
      dispatch(setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password }).unwrap();
      dispatch(setUser(result.user));
      dispatch(setSession(result.session));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpMutation({ email, password }).unwrap();
      dispatch(setUser(result.user));
      dispatch(setSession(result.session));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation().unwrap();
      dispatch(setUser(null));
      dispatch(setSession(null));
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    session,
    loading: loading || sessionLoading,
    signIn,
    signUp,
    signOut,
    isSigningIn: signInLoading,
    isSigningUp: signUpLoading,
  };
};

