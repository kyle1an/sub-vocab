import type { ParamsDictionary, Request } from 'express-serve-static-core'

export interface RequestBody<T = {}> extends Request<ParamsDictionary, any, T> {}

export interface Status {
  success: boolean
  message?: string
}
