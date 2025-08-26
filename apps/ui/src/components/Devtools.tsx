import { useAtomValue } from 'jotai'
import { DevTools } from 'jotai-devtools'
import css from 'jotai-devtools/styles.css?inline'
import { atomWithStorage } from 'jotai/utils'
import { Fragment } from 'react'

import { isDarkModeAtom } from '@/atoms/ui'
import { myStore } from '@/store/useVocab'
import devtoolsCss from '@/styles/devtools.css?inline'

const jotaiDevtoolsIsShellOpenAtom = atomWithStorage(`jotai-devtools-is-shell-open-V0`, false, undefined, { getOnInit: true })

export function JotaiDevtools() {
  const jotaiDevtoolsIsShellOpen = useAtomValue(jotaiDevtoolsIsShellOpenAtom)
  const isDarkMode = useAtomValue(isDarkModeAtom)
  return (
    <Fragment>
      <style>{devtoolsCss}</style>
      <style>{css}</style>
      <DevTools
        store={myStore}
        isInitialOpen={jotaiDevtoolsIsShellOpen}
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </Fragment>
  )
}
