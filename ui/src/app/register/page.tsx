import { ElForm, ElInput, type FormInstance } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { z } from 'zod'
import { t } from '@/i18n'
import router from '@/router'
import { isUsernameTaken, register } from '@/api/user'
import { inputPasswordSchema, usernameSchema } from '@/lib/validation'
import { createSignal } from '@/lib/composables'
import type { FormRules } from '@/types/forms'

export default defineComponent(() => {
  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive({
    username: '',
    password: '',
    checkPass: '',
  })
  const rules: FormRules<typeof ruleForm> = reactive({
    username: [
      {
        required: true,
        async asyncValidator(rule, username: string, callback) {
          try {
            usernameSchema.parse(String(username))
          } catch (err) {
            if (err instanceof z.ZodError) return callback(new Error(err.issues[0].message))
          }

          if ((await isUsernameTaken({ username })).has) {
            return callback(new Error(`${username} ${t('alreadyTaken')}`))
          }
          callback()
        },
        trigger: 'blur',
      }
    ],
    password: [
      {
        required: true,
        validator(rule, value: string, callback) {
          try {
            inputPasswordSchema.parse(String(value))
          } catch (err) {
            if (err instanceof z.ZodError) return callback(new Error(err.issues[0].message))
          }

          if (ruleForm.checkPass !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('checkPass', () => null).catch(console.error)
          }

          callback()
        },
        trigger: 'blur',
      }
    ],
    checkPass: [
      {
        required: true,
        validator(rule, value: string, callback) {
          if (value === '') {
            return callback(new Error(t('Please input the password again')))
          }

          if (value !== ruleForm.password) {
            return callback(new Error(t('inputsNotMatch')))
          }

          callback()
        },
        trigger: 'blur',
      }
    ],
  })
  const [errorMsg, setErrorMsg] = createSignal('')

  function submitForm(ev: Event) {
    ev.preventDefault()
    const formEl = ruleFormRef.value
    if (!formEl) return
    formEl.validate()
      .then(async () => {
        if ((await register(ruleForm))[0].result === 1) {
          router.push('/login').catch(console.error)
        } else {
          setErrorMsg('Something went wrong.')
        }
      })
      .catch(console.error)
  }

  return () => (
    <div class="flex flex-row">
      <div class="mx-auto py-6">
        <section class="py-5">
          <div class="mx-auto flex flex-col items-center justify-center px-6 lg:py-0">
            <div class="w-full rounded-lg bg-white shadow dark:border sm:max-w-md md:mt-0 xl:p-0">
              <div class="max-w-80 space-y-4 p-6 sm:p-8 md:w-80 md:space-y-6">
                <h1 class="text-xl/tight font-bold tracking-tight text-gray-900 md:text-2xl">
                  {t('signup')}
                </h1>
                <ElForm
                  ref={ruleFormRef}
                  model={ruleForm}
                  rules={rules}
                  label-position="top"
                  label-width="100px"
                  class="[&>.el-form-item_label]:font-bold"
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
                  <ElForm.FormItem
                    label={t('Password')}
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
                    label={t('Confirm')}
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
                      {t('Create Account')}
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
                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?
                  <RouterLink
                    to="/login"
                    class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                  >
                    {` ${t('login')}`}
                  </RouterLink>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
})
