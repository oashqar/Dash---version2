import { supabase } from './supabase';

export async function signUp(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          full_name: name,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
    return data;
  } catch (err: any) {
    console.error('Signup exception:', err);
    if (err.message) {
      throw err;
    }
    throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
    return data;
  } catch (err: any) {
    console.error('Sign in exception:', err);
    if (err.message) {
      throw err;
    }
    throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
