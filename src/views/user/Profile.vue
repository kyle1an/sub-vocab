<script lang="ts" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { changeUsername, isUsernameTaken } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { resetForm } from '@/utils/elements'

const { t } = useI18n()
let { user } = $(useVocabStore())
const ruleFormRef = ref<FormInstance>()

async function checkUsername(rule: FormItemRule | FormItemRule[], username: string, callback: (arg0?: Error) => void) {
  if (!username.length) {
    return callback(new Error(t('Please input name')))
  }

  if (username.length > 20) {
    return callback(new Error(t('Please use a shorter name')))
  }

  if (username.length < 2) {
    return callback(new Error(t('NameLimitMsg')))
  }

  if (username !== user && (await isUsernameTaken({ username })).has) {
    return callback(new Error(`${username}${t('alreadyTaken')}`))
  }

  callback()
}

const ruleForm = reactive({
  username: '',
})
const rules = reactive({
  username: [{ validator: checkUsername, trigger: 'blur' }],
})

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

let errorMsg = $ref('')

async function alterInfo(form: typeof ruleForm) {
  if (form.username !== '' && form.username !== user) {
    form.username = form.username.trim()
    const res = await changeUsername({
      username: user,
      newUsername: form.username,
    })

    if (res.success) {
      user = form.username
    } else {
      errorMsg = res.message || 'something went wrong'
    }
  }
}

const { logout } = useVocabStore()
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-3 border-b pb-1.5 text-xl">
      {{ t('changeUsername') }}
    </div>
    <div class="flex w-80">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-position="top"
        label-width="100px"
        class="max-w-[460px] [&>.el-form-item_label]:font-bold"
        status-icon
      >
        <el-form-item
          :label="t('Name')"
          prop="username"
          :error="errorMsg"
        >
          <el-input
            v-model="ruleForm.username"
            class="!text-base md:!text-xs"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm(ruleFormRef)"
          >
            {{ t('Confirm Changes') }}
          </el-button>
          <el-button @click="resetForm(ruleFormRef)">
            {{ t('Reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="mb-3 border-b pb-1 text-xl">
      {{ t('status') }}
    </div>
    <div class="flex">
      <el-button @click="logout">
        {{ t('log out') }}
      </el-button>
    </div>
  </div>
</template>
