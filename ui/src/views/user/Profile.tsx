import { ElForm, ElInput, type FormInstance } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { z } from 'zod'
import { t } from '@/i18n'
import { changeUsername, isUsernameTaken } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { usernameSchema } from '@/utils/validation'
import { createSignal } from '@/composables/utilities'
import type { FormRules } from '@/types/forms'

export const Profile = defineComponent(() => {
  const store = useVocabStore()
  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive({
    username: '',
  })
  const rules = reactive({
    username: [
      {
        async asyncValidator(rule, username: string, callback) {
          try {
            usernameSchema.parse(String(username))
          } catch (err) {
            if (err instanceof z.ZodError) return callback(new Error(err.issues[0].message))
          }

          if (username !== store.user()) {
            if ((await isUsernameTaken({ username })).has) {
              return callback(new Error(`${username} ${t('alreadyTaken')}`))
            }
          }

          callback()
        },
        trigger: 'blur'
      }
    ],
  } satisfies FormRules<typeof ruleForm>)

  function submitForm(ev: Event) {
    ev.preventDefault()
    const formEl = ruleFormRef.value
    if (!formEl) return
    formEl.validate()
      .then(() => {
        alterInfo(ruleForm).catch(console.error)
      })
      .catch(console.error)
  }

  const [errorMsg, setErrorMsg] = createSignal('')

  async function alterInfo(form: typeof ruleForm) {
    if (form.username !== '' && form.username !== store.user()) {
      form.username = form.username.trim()
      const res = await changeUsername({
        username: store.user(),
        newUsername: form.username,
      })

      if (res.success) {
        store.setUser(form.username)
      } else {
        setErrorMsg(res.message || 'something went wrong')
      }
    }
  }

  const { logout } = useVocabStore()
  return () => (
    <div class="flex flex-col gap-3">
      <div>
        <div class="mb-3 border-b pb-1.5 text-xl">
          {t('changeUsername')}
        </div>
        <div class="flex w-80">
          <ElForm
            ref={ruleFormRef}
            model={ruleForm}
            rules={rules}
            label-position="top"
            label-width="100px"
            class="max-w-[460px] [&>.el-form-item_label]:font-bold"
            status-icon
          >
            <ElForm.FormItem
              label={t('Name')}
              prop="username"
              error={errorMsg()}
            >
              <ElInput
                v-model={ruleForm.username}
                class="!text-base md:!text-xs"
              />
            </ElForm.FormItem>
            <div class="flex flex-row gap-2">
              <button
                class="box-border flex cursor-pointer items-center rounded-md border border-solid border-transparent bg-[hsl(206,100%,52%)] px-3 py-2 text-sm/3 text-white hover:bg-[hsl(206,100%,40%)]"
                style="box-shadow: inset 0 1px 0 0 hsl(0deg 0% 100% / 40%);"
                onClick={submitForm}
              >
                {t('Confirm Changes')}
              </button>
              <button
                class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm/3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600"
                onClick={(ev) => {
                  ev.preventDefault()
                  ruleFormRef.value?.resetFields()
                }}
              >
                {t('Reset')}
              </button>
            </div>
          </ElForm>
        </div>
      </div>
      <div>
        <div class="mb-3 border-b pb-1 text-xl">
          {t('status')}
        </div>
        <div>
          <button
            class="box-border inline-flex h-8 max-h-full grow-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border bg-white px-3 py-2.5 text-center align-middle text-sm/3 tracking-wide text-neutral-800 transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600"
            onClick={logout}
          >
            {t('log out')}
          </button>
        </div>
      </div>
    </div>
  )
})
