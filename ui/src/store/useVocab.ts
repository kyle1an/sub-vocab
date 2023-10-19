import { proxy, subscribe, useSnapshot } from 'valtio'
import Cookies from 'js-cookie'

type Store = {
  username: string
}

const localStorageState = JSON.parse(localStorage.getItem('store') as string) as Store | undefined

export const store = proxy<Store>(localStorageState || {
  username: Cookies.get('_user') ?? '',
})

export const useSnapshotStore = () => useSnapshot(store)

export const setUsername = (name: string) => {
  store.username = name
}

subscribe(store, () => {
  localStorage.setItem('store', JSON.stringify(store))
})

export * from 'valtio'
