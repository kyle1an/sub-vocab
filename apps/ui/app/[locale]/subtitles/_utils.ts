import type { SubtitleData } from '@/app/[locale]/subtitles/_components/columns'

export type RowId = {
  // https://standardschema.dev/#why-did-you-prefix-the-standard-property-with-
  '~rowId'?: string
}

export const getFileId = (row: SubtitleData & RowId) => row['~rowId'] ?? String(row.subtitle.attributes.files[0]?.file_id ?? '')
