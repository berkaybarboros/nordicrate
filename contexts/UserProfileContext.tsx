'use client';

/**
 * UserProfileContext — onboarding profilini site geneline yayan tek kaynak.
 *
 * Oturum + user_profiles satırını BİR KEZ yükler; auth değişimlerinde tazeler.
 * Tüketiciler (RateCard, PersonalizedRecs, WelcomeBack, AIAssistant...) kendi
 * fetch'ini açmaz — useUserProfile() ile okur. Anonim kullanıcıda profile=null.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserProfile, type UserProfileInput } from '@/lib/db';

interface UserProfileCtx {
  profile: UserProfileInput | null;
  /** İlk yükleme bitene kadar true — chip'ler flash yapmasın diye beklenebilir */
  loading: boolean;
  /** Profil güncellendikten sonra (ör. onboarding bitişi) manuel tazeleme */
  refresh: () => Promise<void>;
}

const Ctx = createContext<UserProfileCtx>({
  profile: null,
  loading: true,
  refresh: async () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfileInput | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setProfile(null); return; }
      setProfile(await getUserProfile(session.user.id));
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        load();
      }
    });
    return () => subscription.unsubscribe();
  }, [load]);

  return (
    <Ctx.Provider value={{ profile, loading, refresh: load }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserProfile() {
  return useContext(Ctx);
}
