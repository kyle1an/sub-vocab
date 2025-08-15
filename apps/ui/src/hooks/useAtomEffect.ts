// https://jotai.org/docs/recipes/use-atom-effect
import { atomEffect } from 'jotai-effect'
import { useAtomValue } from 'jotai/react'
import { useMemoOne as useStableMemo } from 'use-memo-one'

type EffectFn = Parameters<typeof atomEffect>[0]

export function useAtomEffect(effectFn: EffectFn) {
  useAtomValue(useStableMemo(() => atomEffect(effectFn), [effectFn]))
}

export { useCallbackOne as useStableCallback } from 'use-memo-one'
