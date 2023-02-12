import type { FormInstance } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineComponent, reactive, ref } from 'vue'
import { z } from 'zod'
import { t } from '@/i18n'
import { changeUsername, isUsernameTaken } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { resetForm } from '@/utils/elements'
import { usernameSchema } from '@/utils/validation'
import { useState } from '@/composables/utilities'
import type { FormRules } from '@/types/forms'

export const Profile = defineComponent({
  setup() {
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

            if (username !== store.user) {
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

    function submitForm(formEl: FormInstance | undefined) {
      if (!formEl) return
      formEl.validate((valid) => {
        if (!valid) {
          console.log('error submit!')
          return false
        }

        alterInfo(ruleForm)
      })
    }

    const [errorMsg, setErrorMsg] = useState('')

    async function alterInfo(form: typeof ruleForm) {
      if (form.username !== '' && form.username !== store.user) {
        form.username = form.username.trim()
        const res = await changeUsername({
          username: store.user,
          newUsername: form.username,
        })

        if (res.success) {
          store.user = form.username
        } else {
          setErrorMsg(res.message || 'something went wrong')
        }
      }
    }

    const { logout } = useVocabStore()
    return () => (
      <div class="flex flex-col">
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
            <ElFormItem>
              <ElButton
                type="primary"
                onClick={() => submitForm(ruleFormRef.value)}
              >
                {t('Confirm Changes')}
              </ElButton>
              <ElButton onClick={() => resetForm(ruleFormRef.value)}>
                {t('Reset')}
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>
        <div class="mb-3 border-b pb-1 text-xl">
          {t('status')}
        </div>
        <div class="flex">
          <ElButton onClick={logout}>
            {t('log out')}
          </ElButton>
        </div>
      </div>
    )
  }
})
