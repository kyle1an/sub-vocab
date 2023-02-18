import { LabelFromUser } from '../../../backend/routes/vocab'

export interface LabelVocab extends Record<string, unknown> {
  w: string;
  up: boolean;
  src: {
    sentenceId: number;
    startIndex: number;
    wordLength: number;
    wordSequence: number;
  }[];
  vocab?: LabelSieveDisplay;
  derive?: LabelVocab[];
  variant?: boolean;
  wFamily?: string[];
}

export interface MyVocabRow {
  vocab: LabelSieveDisplay;
}

export interface LabelSieveDisplay extends LabelFromUser {
  inStore: boolean,
  inUpdating: boolean,
}

export interface LabelSubDisplay extends LabelSieveDisplay {
  wFamily: string[];
}

export type SrcRow<T> = {
  src: LabelVocab['src'];
  vocab: T;
}
