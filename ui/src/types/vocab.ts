export interface LabelFromUser extends Record<string, unknown> {
  w: string;
  acquainted: number | boolean,
  is_user: number | boolean,
  original: number | boolean,
  rank: number | null,
  time_modified: string | null,
}

export interface LabelFlag {
  inStore: boolean,
  inUpdating: boolean,
}

export type VocabSource = {
  sentenceId: number;
  startIndex: number;
  wordLength: number;
  wordSequence: number;
}[]

export interface LabelBase extends Record<string, unknown> {
  w: string;
  up: boolean;
  src: VocabSource;
}

export interface LabelVocab extends LabelBase {
  vocab?: LabelSieveDisplay;
  derive?: LabelVocab[];
  variant?: boolean;
  wFamily?: string[];
}

export interface MyVocabRow {
  vocab: LabelSieveDisplay;
}

export interface LabelSieveDisplay extends LabelFromUser, LabelFlag {}

export interface LabelSubDisplay extends LabelSieveDisplay {
  wFamily: string[];
}

export type SrcRow<T> = {
  src: VocabSource;
  vocab: T;
}
