import type { FormInstance } from 'element-plus'

export function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.resetFields()
}
