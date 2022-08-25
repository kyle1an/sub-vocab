<script lang="ts" setup>
import type { FormInstance, FormItemRule } from 'element-plus'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import Cookies from 'js-cookie'
import { useUserStore } from '@/store/useState'
import router from '@/router'
import { changeUsername, isUsernameTaken, logoutToken } from '@/api/user'
import { useVocabStore } from '@/store/useVocab'
import { resetForm } from '@/utils/elements'

const { t } = useI18n()
const store = useUserStore()
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

  if (username !== store.user.name && (await isUsernameTaken({ username })).has) {
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

const errorMsg = ref('')

async function alterInfo(form: typeof ruleForm) {
  if (form.username !== '' && form.username !== store.user.name) {
    form.username = form.username.trim()
    const res = await changeUsername({
      username: store.user.name,
      newUsername: form.username,
    })

    if (res.success) {
      store.user.name = form.username
    } else {
      errorMsg.value = res.message || 'something went wrong'
    }
  }
}

const userStore = useUserStore()

async function logOut() {
  await logoutToken({ username: store.user.name })
  Cookies.remove('_user', { path: '' })
  Cookies.remove('acct', { path: '' })
  userStore.user.name = ''
  useVocabStore().resetUserVocab()
  setTimeout(() => {
    router.push('/login')
  }, 0)
}
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
      <el-button @click="logOut">
        {{ t('log out') }}
      </el-button>
    </div>
  </div>
</template>
