import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', () => {
  const user: any = {
    name: ''
  }
  return { user }
})
