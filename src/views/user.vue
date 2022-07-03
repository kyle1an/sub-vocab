<script lang="ts" setup>
import { useUserStore } from '../store/useState';
import router from '../router';

import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { changePassword, changeUsername, existsUsername, logoutToken } from '../api/user';
import { eraseCookie } from '../utils/cookie';
import { useVocabStore } from '../store/useVocab';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const store = useUserStore()
const ruleFormRef = ref<FormInstance>()

async function checkUsername(rule: any, value: any, callback: any) {
  const username = String(value)
  if (!username.length) {
    return callback(new Error(t('Please input name')))
  }

  if (username.length > 20) {
    return callback(new Error(t('Please use a shorter name')))
  }

  if (username.length < 2) {
    return callback(new Error(t('NameLimitMsg')))
  }

  if (username !== store.user.name && (await existsUsername({ username })).has) {
    return callback(new Error(`${username}${t('alreadyTaken')}`))
  }

  callback()
}

function validatePass(rule: any, value: any, callback: any) {
  if (value === '') {
    return callback();
  }

  if (ruleForm.value.checkPass !== '') {
    if (!ruleFormRef.value) return
    ruleFormRef.value.validateField('checkPass', () => null)
  }

  callback()
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '' && ruleForm.value.password === '') {
    return callback()
  }

  if (value !== ruleForm.value.password) {
    return callback(new Error(t('inputsNotMatch')))
  }

  callback()
}

const ruleForm = ref({
  username: '',
  oldPassword: '',
  password: '',
  checkPass: '',
})

const rules = reactive({
  username: [{ validator: checkUsername, trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
})

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      console.log('error submit!')
      return false
    }

    alterInfo(ruleForm.value)
  })
}

const errorMsg = ref('')

async function alterInfo(form: any) {
  if (form.password !== '') {
    form.password = form.password.trim()
    const res = await changePassword({
      username: form.username,
      oldPassword: form.oldPassword,
      newPassword: form.password,
    })

    if (res.success) {
      await logOut()
    } else {
      errorMsg.value = res.message || 'something went wrong'
    }
  }

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

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.resetFields()
}

const userStore = useUserStore()
const vocabStore = useVocabStore()

async function logOut() {
  await logoutToken({ username: store.user.name })
  eraseCookie(['_user', 'acct'])
  userStore.user.name = ''
  setTimeout(() => {
    router.push('/login')
    vocabStore.fetchVocab('')
  }, 0)
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main class="mx-auto">
        <el-card shadow="always" class="w-80 flex justify-center mx-auto">
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-position="top"
            label-width="100px"
            class="demo-ruleForm"
            style="max-width: 460px"
            status-icon
          >
            <el-form-item :label="t('Name')" prop="username" :error="errorMsg">
              <el-input v-model.number="ruleForm.username" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item :label="t('Old Password')" prop="oldPassword">
              <el-input v-model="ruleForm.oldPassword" type="password" autocomplete="off" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item :label="t('New Password')" prop="password">
              <el-input v-model="ruleForm.password" type="password" autocomplete="off" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item :label="t('New Password Confirm')" prop="checkPass">
              <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">{{ t('Confirm Changes') }}</el-button>
              <el-button @click="resetForm(ruleFormRef)">{{ t('Reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <div class="flex justify-center pt-8">
          <el-button @click="logOut">{{ t('log out') }}</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
:deep(.el-form-item label) {
  font-weight: bold;
}
</style>
