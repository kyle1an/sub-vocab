import type { FormRules as FRs } from 'element-plus'

export type FormRules<T> = Partial<Record<keyof T, FRs[keyof FRs]>>
