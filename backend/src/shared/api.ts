export interface Username {
  username: string
}

export interface Credential extends Username {
  password: string
}

export interface NewUsername extends Username {
  newUsername: string
}

export interface NewCredential extends Username {
  oldPassword: string
  newPassword: string
}

export interface UserVocab extends Username {
  username: string
  words: string[]
}

export interface ServerToClientEvents {
  acquaintWords: (arg: { words: string[] }) => void
  revokeWord: (arg: { words: string[] }) => void
}

export interface ClientToServerEvents {
}

export interface InterServerEvents {
}

export interface SocketData {
}
