import type { FormInstance } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { t } from '@/i18n'
import { changePassword } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { createSignal } from '@/composables/utilities'
import type { FormRules } from '@/types/forms'

export const Password = defineComponent({
  setup() {
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
          trigger: 'blur'
        }
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
          trigger: 'blur'
        }
      ],
    })

    function submitForm() {
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
          await useVocabStore().logout()
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
            <ElFormItem
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
            </ElFormItem>
            <ElFormItem
              label={t('New Password')}
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
              label={t('New Password Confirm')}
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
                onClick={submitForm}
              >
                {t('Confirm Changes')}
              </ElButton>
              <ElButton onClick={() => ruleFormRef.value?.resetFields()}>
                {t('Reset')}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>
      </div>
    )
  }
})
