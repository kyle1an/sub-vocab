import { ElForm, ElInput, type FormInstance } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { t } from '@/i18n'
import { changePassword } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { createSignal } from '@/lib/composables'
import type { FormRules } from '@/types/forms'

export default defineComponent(() => {
  const store = useVocabStore()
  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive({
    oldPassword: '',
    password: '',
    checkPass: '',
  })
  const rules: FormRules<typeof ruleForm> = reactive({
    password: [
      {
        validator(rule, value: string, callback) {
          if (value === '') {
            return callback()
          }

          if (ruleForm.checkPass !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('checkPass', () => null).catch(console.error)
          }

          callback()
        },
        trigger: 'blur',
      },
    ],
    checkPass: [
      {
        validator(rule, value: string, callback) {
          if (value === '' && ruleForm.password === '') {
            return callback()
          }

          if (value !== ruleForm.password) {
            return callback(new Error(t('inputsNotMatch')))
          }

          callback()
        },
        trigger: 'blur',
      },
    ],
  })

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
    if (form.password !== '') {
      form.password = form.password.trim()
      const res = await changePassword({
        username: store.user(),
        oldPassword: form.oldPassword,
        newPassword: form.password,
      })

      if (res.success) {
        useVocabStore().logout()
      } else {
        setErrorMsg(res.message || 'something went wrong')
      }
    }
  }

  return () => (
    <div class="flex flex-col">
      <div class="mb-3 border-b pb-1.5 text-xl">
        {t('changePassword')}
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
            label={t('Old Password')}
            prop="oldPassword"
            error={errorMsg()}
          >
            <ElInput
              v-model={ruleForm.oldPassword}
              type="password"
              autocomplete="off"
              class="!text-base md:!text-xs"
            />
          </ElForm.FormItem>
          <ElForm.FormItem
            label={t('New Password')}
            prop="password"
          >
            <ElInput
              v-model={ruleForm.password}
              type="password"
              autocomplete="off"
              class="!text-base md:!text-xs"
            />
          </ElForm.FormItem>
          <ElForm.FormItem
            label={t('New Password Confirm')}
            prop="checkPass"
          >
            <ElInput
              v-model={ruleForm.checkPass}
              type="password"
              autocomplete="off"
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
  )
})
