import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const getValidUrl = (envUrl: string | undefined): string => {
  if (!envUrl) {
    throw new Error('VITE_SUPABASE_URL environment variable is required');
  }
  try {
    new URL(envUrl);
    return envUrl;
  } catch {
    throw new Error('Invalid VITE_SUPABASE_URL format');
  }
};

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

// Safe storage that works in cross-origin iframes where localStorage is blocked
const safeStorage = {
  getItem: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* iframe */ } },
  removeItem: (key: string) => { try { localStorage.removeItem(key); } catch { /* iframe */ } },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: safeStorage,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'experimentai-feedback-system',
      'apikey': supabaseAnonKey
    }
  }
});

// Database connection health check (for diagnostics only)
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('customer')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Create a simple client for anonymous operations
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// Connection retry mechanism for transient failures
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
};