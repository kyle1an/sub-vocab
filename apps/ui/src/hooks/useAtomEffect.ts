import type { DependencyList } from 'react'

import { atomEffect } from 'jotai-effect'
import { useAtomValue } from 'jotai/react'
import { useCallbackOne as useStableCallback, useMemoOne as useStableMemo } from 'use-memo-one'

type EffectFn = Parameters<typeof atomEffect>[0]

// https://jotai.org/docs/recipes/use-atom-effect
export function useAtomEffect(effectFn: EffectFn, inputs: DependencyList | undefined) {
  const effect = useStableCallback(effectFn, [inputs])
  useAtomValue(useStableMemo(() => atomEffect(effect), [effect]))
}
