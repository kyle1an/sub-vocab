export interface VocabFromUser extends Record<string, unknown> {
  w: string;
  acquainted: number | boolean,
  is_user: number | boolean,
  original: number | boolean,
  rank: number | null,
  time_modified: string | null,
}

export interface VocabInfoSieveDisplay extends VocabFromUser, InUpdating {}

export interface InUpdating {
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
  vocab?: VocabInfoSieveDisplay;
  derive?: LabelVocab[];
  variant?: boolean;
  wFamily?: string[];
}

export interface MyVocabRow {
  vocab: VocabInfoSieveDisplay;
}

export interface VocabInfoSubDisplay extends VocabInfoSieveDisplay {
  wFamily: string[];
}

export type SrcRow<T> = {
  src: VocabSource;
  vocab: T;
}

export interface AcquaintToggle {
  acquainted: number | boolean;
  inUpdating: boolean;
}
