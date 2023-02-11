import { FormItemRule } from 'element-plus/es/tokens/form'

type Arrayable<T> = T | T[];

export type FormRules<T> = Partial<Record<keyof T, Arrayable<FormItemRule>>>;
