import Cookies from 'js-cookie'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { Language } from 'element-plus/es/locale'
import { ElConfigProvider, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { i18n, t } from '@/i18n'
import { useVocabStore } from '@/store/useVocab'

export const TopBar = defineComponent(() => {
  const { locale } = i18n.global
  const localeMap = {
    'en': en,
    'zh': zhCn,
  } as const satisfies Record<string, Language>
  const elLocale = () => localeMap[locale.value]
  const store = useVocabStore()
  const isWide = window.innerWidth >= 460

  function handleCommand(command: typeof locale.value) {
    Cookies.set('_locale', command, { expires: 365 })
    locale.value = command
  }

  return () => (
    <header class="z-50 box-border flex w-full min-w-[auto] items-center justify-center bg-white tracking-wide shadow [&_[href]]:tap-transparent">
      <nav class="box-border flex h-full w-full max-w-screen-xl justify-center">
        <div class="flex w-full items-center text-[14px]">
          <RouterLink
            to="/"
            class="flex h-full items-center px-4 hover:bg-gray-100"
          >
            {t('home')}
          </RouterLink>
          {(!!store.user() || isWide) && (
            <RouterLink
              to="/about"
              class="flex items-center rounded-full px-4 py-1 hover:bg-gray-100"
            >
              {t('about')}
            </RouterLink>
          )}
          <div class="grow" />
          {(!!store.user() || isWide) && (
            <RouterLink
              to="/mine"
              class="flex h-full items-center px-4 hover:bg-gray-100"
            >
              {store.user() ? t('mine') : t('common')}
            </RouterLink>
          )}
          {store.user() ? (
            <RouterLink
              to="/user"
              class="flex h-full items-center px-4 hover:bg-gray-100"
            >
              {store.user()}
            </RouterLink>
          ) : (
            <>
              <RouterLink
                to="/login"
                class="flex items-center rounded-md px-4 py-1 hover:bg-gray-100"
              >
                {t('login')}
              </RouterLink>
              <RouterLink
                to="/register"
                class="ml-2 box-border flex cursor-pointer items-center rounded border border-solid border-transparent bg-[hsl(206,100%,52%)] px-3 py-2 leading-[14px] text-white hover:bg-[hsl(206,100%,40%)]"
                style="box-shadow: inset 0 1px 0 0 hsl(0deg 0% 100% / 40%);"
              >
                {t('signup')}
              </RouterLink>
            </>
          )}
          <ElDropdown
            onCommand={handleCommand}
            v-slots={{
              default: () =>
                <div class="flex px-4 outline-none">
                  文/Aa
                  <i class="el-icon el-icon--right">
                    <svg
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      class="text-slate-300"
                    >
                      <path
                        fill="currentColor"
                        d="m192 384 320 384 320-384z"
                      />
                    </svg>
                  </i>
                </div>,
              dropdown: () =>
                <ElDropdownMenu class="outline-none">
                  <ElDropdownItem command="zh">
                    中文
                  </ElDropdownItem>
                  <ElDropdownItem command="en">
                    English
                  </ElDropdownItem>
                </ElDropdownMenu>
            }}
          />
          <ElConfigProvider locale={elLocale()} />
          <a
            href="https://github.com/kyle1an/sub-vocab"
            target="_blank"
            class="mr-3 block text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 xl:mr-0"
          >
            <span class="sr-only">SubVocab on GitHub</span>
            <svg
              viewBox="0 0 16 16"
              class="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  )
})
