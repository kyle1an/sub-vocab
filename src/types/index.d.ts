export interface Segment {
  id: number,
  title: string,
  default?: boolean
}

export interface Suffix {
  d: Record<string, any>,
  es: Record<string, any>,
  ing: Record<string, any>,
  s: Record<string, any>,
}

export interface Vocab {
  F?: boolean;
  freq: number;
  len: number;
  W?: string;
  w: string;
  seq: number;
  src: Array<any>;
}
