import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSessionProfile() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);

      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!mounted) return;
        if (!error) setProfile(data);
      }
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s?.user) setProfile(null);
      else {
        supabase.from('profiles').select('*').eq('id', s.user.id).single()
          .then(({ data }) => setProfile(data || null));
      }
    });

    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, []);

  return { loading, session, profile };
}
