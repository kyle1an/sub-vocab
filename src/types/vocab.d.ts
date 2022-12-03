export interface UserVocab extends Record<string, unknown> {
  w: string;
  acquainted: number | boolean,
  is_user: number | boolean,
  rank?: number | null,
  time_modified?: string | null,
}

export interface Sieve extends UserVocab {
  inUpdating: boolean,
}

export interface LabelBase extends Record<string, unknown> {
  w: string;
  up: boolean;
  src: Source;
}

export interface LabelPre extends LabelBase {
  vocab: Sieve;
}

export interface Label extends LabelBase {
  vocab?: Sieve;
  derive?: Label[];
  variant?: boolean;
  wFamily?: string[];
}

export type MyVocabRow = Pick<LabelPre, 'vocab'>;
export type SourceRow = Pick<LabelPre, 'vocab' | 'src'>;

export interface VocabDisplay extends UserVocab {
  wFamily: string[];
  inUpdating: boolean,
}

export type RowDisplay = {
  src: Source;
  vocab: VocabDisplay;
}

export type Source = number[][];
