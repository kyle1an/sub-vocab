import type { SubtitleData } from '@/components/subtitle/columns'

export const getFileId = (row: SubtitleData) => String(row.attributes.files[0]?.file_id ?? '')
