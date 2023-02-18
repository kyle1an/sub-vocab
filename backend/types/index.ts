import type { Request, Response, Send } from 'express-serve-static-core'

export interface RequestBody<T = {}> extends Request {
  body: T
}

export interface TypedResponse<ResBody = {}> extends Response {
  json: Send<ResBody, this>;
}

export interface Status {
  success: boolean
  message?: string
}
