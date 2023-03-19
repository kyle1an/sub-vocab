import { FormItemRule } from 'element-plus'

type Arrayable<T> = T | T[];

export type FormRules<T> = Partial<Record<keyof T, Arrayable<FormItemRule>>>;
