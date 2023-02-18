import type { FormInstance } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { z } from 'zod'
import { t } from '@/i18n'
import router from '@/router'
import { isUsernameTaken, register } from '@/api/user'
import { inputPasswordSchema, usernameSchema } from '@/utils/validation'
import { useState } from '@/composables/utilities'
import type { FormRules } from '@/types/forms'

export const Register = defineComponent({
  setup() {
    const ruleFormRef = ref<FormInstance>()
    const ruleForm = reactive({
      username: '',
      password: '',
      checkPass: '',
    })
    const rules = reactive({
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
              ruleFormRef.value.validateField('checkPass', () => null)
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
    } satisfies FormRules<typeof ruleForm>)
    const [errorMsg, setErrorMsg] = useState('')

    function submitForm(formEl: FormInstance | undefined) {
      if (!formEl) return
      formEl.validate(async (valid) => {
        if (!valid) {
          return false
        }

        if (!await registerStatus(ruleForm)) {
          setErrorMsg('Something went wrong.')
          return
        }

        await router.push('/login')
      })
    }

    async function registerStatus(form: {
      username: string;
      password: string;
    }) {
      const signUpRes = await register(form)
      return signUpRes[0].result === 1
    }

    return () => (
      <div class="flex flex-row">
        <div class="mx-auto py-6">
          <section class="py-5">
            <div class="mx-auto flex flex-col items-center justify-center px-6 lg:py-0">
              <div class="w-full rounded-lg bg-white shadow dark:border sm:max-w-md md:mt-0 xl:p-0">
                <div class="max-w-80 space-y-4 p-6 sm:p-8 md:w-80 md:space-y-6">
                  <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
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
                    <ElFormItem
                      label={t('Confirm')}
                      prop="checkPass"
                    >
                      <ElInput
                        v-model={ruleForm.checkPass}
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
                        {t('Create Account')}
                      </ElButton>
                      <ElButton onClick={() => ruleFormRef.value && ruleFormRef.value.resetFields()}>
                        {t('Reset')}
                      </ElButton>
                    </ElFormItem>
                  </ElForm>
                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account?
                    <RouterLink
                      to="/login"
                      class="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                    >
                      {t('login')}
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
