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

export interface Word {
  len: number;
  w: string;
}

export interface Vocab extends Word {
  F?: boolean;
  freq: number;
  W?: string;
  seq: number;
  src: Array<any>;
}
