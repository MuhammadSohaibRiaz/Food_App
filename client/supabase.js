import {createClient} from '@supabase/supabase-js';
import "react-native-url-polyfill/auto";
import AsyncStorage from '@react-native-async-storage/async-storage';


const supabaseUrl = "https://glmqlmokttrhuatzymcj.supabase.co";
 const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXFsbW9rdHRyaHVhdHp5bWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzA2NzEsImV4cCI6MjA0OTk0NjY3MX0.bEzfjjM-BNN8Zm7Gl--aLi0kuWjYZnmCQUJ4pzLs2mE";

 export const supabase = createClient(supabaseUrl,supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });