import { create } from 'zustand';
import { gql } from '@apollo/client';
import { client } from '../providers/apollo';
import { NavigateFunction } from 'react-router-dom';
import { ThemeSettings, saveThemeSettings } from '../lib/utils';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, navigate: NavigateFunction) => Promise<void>;
  register: (name: string, email: string, password: string, navigate: NavigateFunction, isRenter?: boolean) => Promise<void>;
  logout: (navigate: NavigateFunction) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const defaultThemeSettings: ThemeSettings = {
  fontSize: 'medium',
  fontFamily: 'inter',
  colorScheme: 'default',
  darkMode: false,
};

async function fetchOrCreateThemeSettings(userId: string): Promise<ThemeSettings> {
  // Try to fetch
  try {
    const { data } = await client.query({
      query: gql`
        query ThemeSettings($userId: ID!) {
          themeSettings(userId: $userId) {
            id
            fontSize
            fontFamily
            colorScheme
            darkMode
          }
        }
      `,
      variables: { userId },
      fetchPolicy: 'no-cache'
    });

    if (data.themeSettings) {
      console.log(data.themeSettings, "** data.themeSettings **");

      const theme = data.themeSettings as ThemeSettings;
      saveThemeSettings(theme);
      return theme;
    }

    // If not found, create
    const { data: createData } = await client.mutate({
      mutation: gql`
        mutation CreateThemeSettings($input: CreateThemeSettingsInput!) {
          createThemeSettings(input: $input) {
            id
            fontSize
            fontFamily
            colorScheme
            darkMode
          }
        }
      `,
      variables: { input: { userId, ...defaultThemeSettings } }
    });

    const theme = createData.createThemeSettings as ThemeSettings;
    saveThemeSettings(theme);
    return theme;
  } catch (error) {
    console.error('Error fetching or creating theme settings:', error);
    return defaultThemeSettings;
  }
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  checkAuthStatus: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await client.query<{ me: User }>({
        query: gql`
          query {
            me {
              id
              name
              email
              role
            }
          }
        `,
        fetchPolicy: 'no-cache',
      });
      if (data.me) {
        set({ user: data.me, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password, navigate) => {
    set({ loading: true, error: null });
    try {
      const { data } = await client.mutate<{
        login: { user: User; success: boolean }
      }>({
        mutation: gql`
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              user {
                id
                name
                email
                role
              }
              success
            }
          }
        `,
        variables: { email, password },
      });
      console.log(data, "** data **");
      console.log(data?.login?.user, "** data?.login?.user **");

      if (data?.login?.user) {
        set({ user: data.login.user, isAuthenticated: true });
        // Fetch or create theme settings after login
        await fetchOrCreateThemeSettings(data.login.user.id);
        navigate('/');
      } else {
        set({ error: 'Login failed - Invalid credentials', user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Login error details:', error);
      // More descriptive error message based on the error
      const errorMessage = error instanceof Error 
        ? `Login failed: ${error.message}` 
        : 'Login failed - Server error';
      set({ error: errorMessage, user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password, navigate, isRenter = false) => {
    set({ loading: true, error: null });
    try {
      const { data } = await client.mutate<{
        register: { user: User; success: boolean }
      }>({
        mutation: gql`
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              user {
                id
                name
                email
                role
              }
              success
            }
          }
        `,
        variables: { input: { name, email, password, isRenter } },
      });
      if (data?.register?.user) {
        set({ user: data.register.user, isAuthenticated: true });
        // Fetch or create theme settings after register
        await fetchOrCreateThemeSettings(data.register.user.id);
        navigate('/');
      } else {
        set({ error: 'Registration failed', user: null, isAuthenticated: false });
      }
    } catch {
      set({ error: 'Registration failed', user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  logout: async (navigate) => {
    set({ loading: true, error: null });
    try {
      await client.mutate({
        mutation: gql`
          mutation {
            logout {
              success
            }
          }
        `,
      });
    } catch {
      // Ignore error, always clear state
    } finally {
      set({ user: null, isAuthenticated: false, loading: false });
      navigate('/login');
    }
  },
}));