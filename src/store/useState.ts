import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', () => {
  const user = {
    name: ''
  }
  return { user }
})
