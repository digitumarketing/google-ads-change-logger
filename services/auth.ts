import { supabase } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  async signUp(email: string, password: string, name: string, role: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) return { user: null, error: authError };
      if (!authData.user) return { user: null, error: new Error('User creation failed') };

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          auth_id: authData.user.id,
          email,
          name,
          role,
        }])
        .select()
        .single();

      if (userError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: userError };
      }

      return {
        user: {
          id: userData.id,
          authId: userData.auth_id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        error: null,
      };
    } catch (error) {
      return { user: null, error };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) return { user: null, error: authError };
      if (!authData.user) return { user: null, error: new Error('Sign in failed') };

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      if (userError) return { user: null, error: userError };
      if (!userData) return { user: null, error: new Error('User not found in database') };

      return {
        user: {
          id: userData.id,
          authId: userData.auth_id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        error: null,
      };
    } catch (error) {
      return { user: null, error };
    }
  },

  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentSession(): Promise<{ user: User | null; error: any }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) return { user: null, error: sessionError };
      if (!session) return { user: null, error: null };

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (userError) return { user: null, error: userError };
      if (!userData) return { user: null, error: new Error('User not found') };

      return {
        user: {
          id: userData.id,
          authId: userData.auth_id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        error: null,
      };
    } catch (error) {
      return { user: null, error };
    }
  },
};
