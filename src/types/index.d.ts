export interface Segment {
  id: number,
  title: string,
  default?: boolean
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
