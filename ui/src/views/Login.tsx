import type { FormInstance } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { z } from 'zod'
import { RouterLink } from 'vue-router'
import { t } from '@/i18n'
import { useVocabStore } from '@/store/useVocab'
import { resetForm } from '@/utils/elements'
import { inputPasswordSchema, inputnameSchema } from '@/utils/validation'
import { useState } from '@/composables/utilities'
import type { FormRules } from '@/types/forms'

export const Login = defineComponent({
  setup() {
    const { login } = useVocabStore()
    const ruleFormRef = ref<FormInstance>()
    const ruleForm = reactive({
      username: '',
      password: '',
    })
    const rules = reactive({
      username: [
        {
          required: true,
          validator(rule, username: string | number, callback) {
            try {
              inputnameSchema.parse(String(username).trim())
            } catch (err) {
              if (err instanceof z.ZodError) return callback(new Error(err.issues[0].message))
            }
            callback()
          },
          trigger: 'blur',
        }
      ],
      password: [
        {
          required: true,
          validator(rule, password: string | number, callback) {
            try {
              inputPasswordSchema.parse(String(password))
            } catch (err) {
              if (err instanceof z.ZodError) return callback(new Error(err.issues[0].message))
            }
            callback()
          },
          trigger: 'blur',
        }
      ],
    } satisfies FormRules<typeof ruleForm>)
    const [errorMsg, setErrorMsg] = useState('')

    function submitForm(formEl: FormInstance | undefined) {
      if (!formEl) return
      formEl.validate(async (valid) => {
        if (!valid) return

        if (!(await login(ruleForm))) {
          setErrorMsg(t('incorrectUserPassword'))
        }
      }).then()
    }

    return () => (
      <div class="flex flex-row">
        <div class="mx-auto py-6">
          <section class="py-5">
            <div class="mx-auto flex flex-col items-center justify-center px-6 py-8 lg:py-0">
              <div class="w-full rounded-lg bg-white shadow dark:border sm:max-w-md md:mt-0 xl:p-0">
                <div class="max-w-80 space-y-4 p-6 sm:p-8 md:w-80 md:space-y-6">
                  <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                    {t('login')}
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
                    <ElFormItem
                      label={t('Name')}
                      prop="username"
                      error={errorMsg.value}
                    >
                      <ElInput
                        v-model={ruleForm.username}
                        class="!text-base md:!text-xs"
                      />
                    </ElFormItem>
                    <ElFormItem
                      label={t('Password')}
                      prop="password"
                    >
                      <ElInput
                        v-model={ruleForm.password}
                        type="password"
                        autocomplete="off"
                        class="!text-base md:!text-xs"
                      />
                    </ElFormItem>
                    <ElFormItem>
                      <ElButton
                        type="primary"
                        onClick={() => submitForm(ruleFormRef.value)}
                      >
                        {t('Submit')}
                      </ElButton>
                      <ElButton onClick={() => resetForm(ruleFormRef.value)}>
                        {t('Reset')}
                      </ElButton>
                    </ElFormItem>
                  </ElForm>
                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don't have an account yet?
                    <RouterLink
                      to="/register"
                      class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                    >
                      {t('signup')}
                    </RouterLink>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }
})
