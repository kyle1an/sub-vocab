import { useAtom } from 'jotai'

import { metaThemeColorAtom } from '@/atoms'
import { authChangeEventAtom, userAtom } from '@/atoms/auth'
import { createClient } from '@/lib/supabase/client'
import { useAtomEffect } from '@sub-vocab/utils/hooks'

export function useAppEffects() {
  useAtomEffect((_, set) => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      set(authChangeEventAtom, event)
      set(userAtom, session?.user)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  useAtom(metaThemeColorAtom)
}
