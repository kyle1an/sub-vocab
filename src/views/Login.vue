<script lang="ts" setup>
import { h, reactive, ref } from 'vue'
import { login } from '../api/user';
import router from '../router';
import type { FormInstance } from 'element-plus'
import { useUserStore } from '../store/useState';
import { setCookie } from '../utils/cookie';
import { ElNotification } from 'element-plus/es';
import { useVocabStore } from '../store/useVocab';

const store = useUserStore()
const ruleFormRef = ref<FormInstance>()

function checkUsername(rule: any, value: any, callback: any) {
  const username = String(value)
  if (!username.length) {
    return callback(new Error('Please input name'))
  }

  if (username.length > 20) {
    return callback(new Error('Please use a shorter name'))
  }

  if (username.length < 2) {
    return callback(new Error('Name must be longer than 1'))
  }

  callback()
}

function validatePass(rule: any, value: any, callback: any) {
  if (value === '') {
    return callback(new Error('Please input the password'))
  }

  callback()
}

const ruleForm = reactive({
  username: '',
  password: '',
})

const rules = reactive({
  username: [{ validator: checkUsername, trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
})
const vocabStore = useVocabStore()

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return

    const resAuth = await login(ruleForm)
    if (!resAuth.length) {
      return ElNotification({
        message: h(
          'span',
          { style: 'color: teal' },
          'The username/password is incorrect.'
        )
      })
    }

    store.user.name = ruleForm.username
    setCookie('_user', ruleForm.username, 30)
    setCookie('acct', resAuth[1], 30)
    setTimeout(() => {
      router.push('/')
      vocabStore.fetchVocab(ruleForm.username)
    }, 0)
  })
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<template>
  <div>
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
            <el-form-item label="Name" prop="username">
              <el-input v-model.number="ruleForm.username" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input v-model="ruleForm.password" type="password" autocomplete="off" class="!text-base md:!text-xs" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">Submit</el-button>
              <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
:deep(.el-form-item label) {
  font-weight: bold;
}
</style>
