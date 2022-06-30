import { stemsMapping } from '../api/vocab-service';

const STEMS_MAPPING: Array<any> = await stemsMapping();
const IRREGULARS = []
for (const row of STEMS_MAPPING) {
  IRREGULARS.push([row.stem_word, ...row.derivations.split(',')])
}

export const IRREGULAR = IRREGULARS;
